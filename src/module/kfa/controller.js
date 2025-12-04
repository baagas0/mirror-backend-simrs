const KFA = require("../../services/IhsKFA");
const model = require("./model");
const { Op } = require("sequelize");
const { v4: uuid_v4 } = require("uuid");

class Controller {
  static async product(req, res) {
    try {
      const { halaman, jumlah, search } = req.body
      const kfa = new KFA();
      const data = await kfa.productAll(halaman||1, jumlah, ' ', search);
      res.status(200).json({
        status: 200,
        message: "product",
        data: (data?.items?.data || [])?.map((x) => ({
          ...x,
          map_id: `${x.kfa_code}|${x.name}`,
        })),
        count: data.total,
        jumlah: data.size,
        halaman: data.page,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Failed to fetch product",
        error: error.message
      });
    }
  }

  static async syncProduct(req, res) {
    try {
      const kfa = new KFA();
      const pageSize = 100;
      const total = 22586; // Total products kfa
      let syncedCount = 0;
      let failedCount = 0;
      let page = 1;
      
      // Get query params for custom sync
      const { startPage, endPage } = req.query;
      const startPageNum = startPage ? parseInt(startPage) : 1;
      const endPageNum = endPage ? parseInt(endPage) : Math.ceil(total / pageSize);
      
      const startTime = new Date();
      const results = {
        total_pages: endPageNum - startPageNum + 1,
        pages_processed: 0,
        items_processed: 0,
        items_synced: 0,
        items_failed: 0,
        errors: []
      };

      // Process pages in batches to avoid memory issues
      for (let currentPage = startPageNum; currentPage <= endPageNum; currentPage++) {
        try {
          console.log(`Fetching page ${currentPage} of ${endPageNum}...`);
          const data = await kfa.productAll(currentPage, pageSize);
          const items = data?.items?.data || [];
          results.items_processed += items.length;
          results.pages_processed++;
          
          if (items.length === 0) {
            console.log(`No items found on page ${currentPage}`);
            continue;
          }
          
          // Process items in batches to avoid overloading the database
          const batchSize = 50;
          for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const mappedItems = batch.map(item => ({
              id: uuid_v4(), // Using kfa_code as primary key
              name: item.name,
              kfa_code: item.kfa_code,
              active: item.active ? '1' : '0',
              state: item.state,
              image: item.image,
              farmalkes_type_code: item.farmalkes_type?.code || null,
              farmalkes_type_name: item.farmalkes_type?.name || null,
              farmalkes_type_group: item.farmalkes_type?.group || null,
              dosage_form_code: item.dosage_form?.code || null,
              dosage_form_name: item.dosage_form?.name || null,
              produksi_buatan: item.produksi_buatan,
              nie: item.nie,
              nama_dagang: item.nama_dagang,
              manufacturer: item.manufacturer,
              registrar: item.registrar,
              generik: item.generik,
              rxterm: item.rxterm,
              dose_per_unit: item.dose_per_unit?.toString() || null,
              fix_price: item.fix_price,
              het_price: item.het_price,
              farmalkes_hscode: item.farmalkes_hscode,
              tayang_lkpp: item.tayang_lkpp,
              kode_lkpp: item.kode_lkpp,
              net_weight: item.net_weight?.toString() || null,
              net_weight_uom_name: item.net_weight_uom_name,
              volume: item.volume?.toString() || null,
              volume_uom_name: item.volume_uom_name,
              med_dev_jenis: item.med_dev_jenis,
              med_dev_subkategori: item.med_dev_subkategori,
              med_dev_kategori: item.med_dev_kategori,
              med_dev_kelas_risiko: item.med_dev_kelas_risiko,
              klasifikasi_izin: item.klasifikasi_izin,
              uom_name: item.uom?.name || null
            }));
            
            try {
              // Using bulkCreate with updateOnDuplicate for efficient upsert
              await model.bulkCreate(mappedItems, {
                updateOnDuplicate: ['kfa_code']
              });
              
              syncedCount += mappedItems.length;
              results.items_synced += mappedItems.length;
              console.log(`Synced batch of ${mappedItems.length} items, total: ${syncedCount}`);
            } catch (batchError) {
              console.error(`Error in batch sync on page ${currentPage}:`, batchError);
              failedCount += mappedItems.length;
              results.items_failed += mappedItems.length;
              results.errors.push({
                page: currentPage,
                batch: i / batchSize + 1,
                message: batchError.message
              });
            }
          }
          
          console.log(`Completed page ${currentPage}, synced: ${syncedCount}, failed: ${failedCount}`);
        } catch (pageError) {
          console.error(`Error processing page ${currentPage}:`, pageError);
          results.errors.push({
            page: currentPage,
            message: pageError.message
          });
        }
      }
      
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000; // in seconds
      
      results.duration_seconds = duration;
      results.items_per_second = Math.round(results.items_synced / duration * 100) / 100;

      res.status(200).json({
        status: 200,
        message: "Sync completed successfully",
        summary: results
      });
    } catch (error) {
      console.error("Fatal error in sync process:", error);
      res.status(500).json({
        status: 500,
        message: "Sync failed",
        error: error.message
      });
    }
  }

  static async getProducts(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { kfa_code: { [Op.iLike]: `%${search}%` } },
          { nama_dagang: { [Op.iLike]: `%${search}%` } },
          { nie: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      const { count, rows } = await model.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      });
      
      res.status(200).json({
        status: 200,
        message: "Success",
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Failed to retrieve products",
        error: error.message
      });
    }
  }
}

module.exports = Controller;