const dform_triage = require('./model')
const { sq } = require("../../config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes, Op } = require('sequelize');
const s = { type: QueryTypes.SELECT };

class Controller {
    static async register(req, res) {
        const {parent_id,show,class_dform_triage,value,label,placeholder,type_dform_triage,required,position,key,getter,api_options,lock,urutan,keterangan,is_array } = req.body;

        try {
        
             let data= await dform_triage.create({id:uuid_v4(),parent_id,show,class_dform_triage,value,label,placeholder,type_dform_triage,required,position,key,getter,api_options,lock,urutan,keterangan,is_array})
              res.status(200).json({ status: 200, message: "sukses",data })
            
        } catch (err) {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        }
    }

    static async update(req, res) {
      const { id,parent_id,show,class_dform_triage,value,label,placeholder,type_dform_triage,required,position,key,getter,api_options,lock,urutan,keterangan,is_array } = req.body;

      try {
         let data = dform_triage.update({parent_id,show,class_dform_triage,value,label,placeholder,type_dform_triage,required,position,key,getter,api_options,lock,urutan,keterangan,is_array},{where:{
            id
         }})
         res.status(200).json({ status: 200, message: "sukses" })
      } catch (err) {
          console.log(req.body);
          console.log(err);
          res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async delete(req, res) {
      const{id}= req.body

      try {
       await dform_triage.destroy({where:{id}})
       res.status(200).json({ status: 200, message: "sukses" })
      } catch (error) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ status: 500, message: "gagal", data: err });
      }
    }

    static async list(req, res) {
      const{halaman,jumlah,id,type_dform_triage,parent_id,show,class_dform_triage,value,label,placeholder,required,position,key,api_options,lock,urutan,is_array}=req.body
      let isi = ''
      let offset=''
      let pagination=''

      if(halaman && jumlah){
        offset = (+halaman -1) * jumlah;
        pagination=`limit ${jumlah} offset ${offset}`
      }


      try {

        if(id){
          isi+= ` and dt.id = '${id}' `
        }
        if(type_dform_triage){
          isi+= ` and dt.type_dform_triage ='${type_dform_triage}'`
        }
        if(parent_id){
          isi+= ` and dt.parent_id ='${parent_id}'`
        }
        if(show){
          isi+= ` and dt.show ='${show}'`
        }
        if(class_dform_triage){
          isi+= ` and dt.class_dform_triage ='${class_dform_triage}'`
        }
        if(value){
          isi+= ` and dt.value ='${value}'`
        }
        if(label){
          isi+= ` and dt.label ='${label}'`
        }
        if(placeholder){
          isi+= ` and dt.placeholder ='${placeholder}'`
        }
        if(required){
          isi+= ` and dt.required ='${required}'`
        }
        if(position){
          isi+= ` and dt.position ='${position}'`
        }
        if(key){
          isi+= ` and dt.key ='${key}'`
        }
        if(api_options){
          isi+= ` and dt.api_options ='${api_options}'`
        }
        if(lock){
          isi+= ` and dt.lock ='${lock}'`
        }
        if(urutan){
          isi+= ` and dt.urutan ='${urutan}'`
        }
        if(is_array){
          isi+= ` and dt.is_array ='${is_array}'`
        }

        let data = await sq.query(`select dt.*, 
        jsonb_agg(jsonb_build_object('id',dto.id,'label_options',dto.label_options,'code_options',dto.code_options)) as dform_triage_options
        from dform_triage dt left join dform_triage_options dto on dt.id=dto.dform_triage_id 
        where dt."deletedAt" isnull ${isi} group by dt.id  order by dt."createdAt" desc ${pagination}
        `, s)

        let jml = await sq.query(`select count(*)
        from dform_triage dt left join dform_triage_options dto on dt.id=dto.dform_triage_id 
        where dt."deletedAt" isnull ${isi} group by dt.id `)

        if(data.length){
          data.forEach(el => {
            // console.log(el.dform_triage_options);
            if(el.dform_triage_options[0].id==null){
              el.dform_triage_options=[]
            }
          });
        }

     
        res.status(200).json({ status: 200, message: "sukses",data,count: jml[0].count, jumlah, halaman })
        
      } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).json({ status: 500, message: "gagal", data: error });
      }
    
    }

    static async detailsById(req, res) {
      const { id } = req.body
      try {
          let data = await sq.query(`select dt.*, 
          jsonb_agg(jsonb_build_object('id',dto.id,'label_options',dto.label_options,'code_options',dto.code_options)) as dform_triage_options
          from dform_triage dt left join dform_triage_options dto on dt.id=dto.dform_triage_id 
          where dt."deletedAt" isnull and dt.id= '${id}'
          group by dt.id `, s)
          if(data[0].length){
            if(data[0].dform_triage_options[0].id==null){
              data[0].dform_triage_options=[]
            }
          }
        

          res.status(200).json({ status: 200, message: "sukses", data })
      } catch (error) {
          console.log(error);
          res.status(500).json({ status: 500, message: "gagal", data: error })
      }
  }


  static async list_tree(req,res){

    try {
      let a = await sq.query(`select dt.*, dt2.label as label_parent,
      jsonb_agg(jsonb_build_object('id',dto.id,'label_options',dto.label_options,'code_options',dto.code_options)) as dform_triage_options
      from dform_triage dt left join dform_triage_options dto on dt.id=dto.dform_triage_id left join dform_triage dt2 on dt2.id = dt.parent_id
      where dt."deletedAt" isnull group by dt.id,dt2.label  order by dt."createdAt" desc `, s)
      let x=[]
      a.forEach(el => {
        if(el.dform_triage_options[0].id==null){
          el.dform_triage_options=[]
        }
      });
       a.forEach(el => {
        if(el.parent_id==null){
          x.push(el)
        }
      });

    

          for (let i = 0; i < x.length; i++) {
            if(x[i].child==null){
              x[i].child=[]
            }
            for (let j = 0; j < a.length; j++) {
                  if(x[i].id==a[j].parent_id){
                  x[i].child.push(a[j])
                }
            }
          }
          
          
          for (let i = 0; i < x.length; i++) {
            for(let j=0;j<x[i].child.length;j++){
              if(x[i].child[j].child==null){
                x[i].child[j].child=[]
              }
              for (let k = 0; k < a.length; k++) {
                if(x[i].child[j].id==a[k].parent_id){
                  x[i].child[j].child.push(a[k])
                }
                
              }
            }
            
          }

          res.status(200).json({ status: 200, message: "sukses", data:x })
    } catch (error) {
          console.log(error);
          res.status(500).json({ status: 500, message: "gagal", data: error })
    }
  

  }
}

module.exports = Controller