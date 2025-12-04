const historyEklaim = require('../history_eklaim/model');
const { v4: uuid_v4 } = require("uuid");
const moment = require('moment');

class HistoryEklaimHelper {

    // Stage definitions for workflow tracking
    static STAGES = {
        NEW_CLAIM: 1,
        UPDATE_PATIENT: 2,
        SET_CLAIM_DATA: 3,
        IDRG_DIAGNOSA_SET: 4,
        IDRG_PROSEDUR_SET: 5,
        GROUPER_IDRG_STAGE1: 6,
        IDRG_GROUPER_FINAL: 7,
        IDRG_TO_INACBG_IMPORT: 8,
        INACBG_DIAGNOSA_SET: 9,
        INACBG_PROSEDUR_SET: 10,
        GROUPER_INACBG_STAGE1: 11,
        GROUPER_INACBG_STAGE2: 12,
        INACBG_GROUPER_FINAL: 13,
        CLAIM_FINAL: 14,
        SEND_CLAIM_INDIVIDUAL: 15,
        GET_CLAIM_STATUS: 16
    };

    static STATUS = {
        PENDING: 'PENDING',
        PROCESSING: 'PROCESSING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED'
    };

    /**
     * Create new history record for eklaim process
     * @param {string} nomor_sep - SEP number
     * @param {string} tagihan_id - Billing ID
     * @param {number} current_stage - Initial stage
     * @param {string} status - Initial status
     */
    static async createHistory(nomor_sep, tagihan_id, current_stage = 0, status = this.STATUS.PENDING) {
        try {
            const id = uuid_v4();
            return await historyEklaim.create({
                id,
                nomor_sep,
                tagihan_id,
                current_stage,
                overall_status: status
            });
        } catch (error) {
            console.error('Error creating history eklaim:', error);
            throw error;
        }
    }

    /**
     * Update history for a specific stage
     * @param {string} nomor_sep - SEP number
     * @param {number} stage - Stage number
     * @param {Object} requestData - Request data
     * @param {Object} responseData - Response data
     * @param {boolean} status - Stage status (success/failure)
     * @param {string} errorMessage - Error message if failed
     */
    static async updateStageHistory(nomor_sep, stage, requestData, responseData, status = true, errorMessage = null) {
        try {
            const updateData = {
                current_stage: stage,
                overall_status: status ? this.STATUS.PROCESSING : this.STATUS.FAILED
            };

            if (errorMessage) {
                updateData.error_message = errorMessage;
            }

            // Update stage-specific fields
            const stageFields = this.getStageFields(stage);
            if (stageFields) {
                updateData[`${stageFields.prefix}_request`] = requestData;
                updateData[`${stageFields.prefix}_response`] = responseData;
                updateData[`${stageFields.prefix}_status`] = status;
                updateData[`${stageFields.prefix}_date`] = new Date();
            }

            // Extract tariff information from grouper responses
            if (responseData && responseData.tarif) {
                updateData.kode_tarif = responseData.tarif.kode_tarif || null;
                updateData.tarif_tarif = responseData.tarif.tarif_tarif || null;
                updateData.deskripsi_tarif = responseData.tarif.deskripsi_tarif || null;
                updateData.cbg_code = responseData.tarif.cbg_code || null;
                updateData.special_cmg = responseData.tarif.special_cmg || null;
                updateData.severity_level = responseData.tarif.severity_level || null;
            }

            const [updatedCount] = await historyEklaim.update(updateData, {
                where: { nomor_sep }
            });

            if (updatedCount === 0) {
                throw new Error(`No history found for SEP: ${nomor_sep}`);
            }

            return await historyEklaim.findOne({ where: { nomor_sep } });
        } catch (error) {
            console.error(`Error updating stage ${stage} history:`, error);
            throw error;
        }
    }

    /**
     * Get field names for specific stage
     * @param {number} stage - Stage number
     * @returns {Object} Field names prefix and other info
     */
    static getStageFields(stage) {
        const stageMap = {
            [this.STAGES.NEW_CLAIM]: { prefix: 'new_claim' },
            [this.STAGES.UPDATE_PATIENT]: { prefix: 'update_patient' },
            [this.STAGES.SET_CLAIM_DATA]: { prefix: 'set_claim_data' },
            [this.STAGES.IDRG_DIAGNOSA_SET]: { prefix: 'idrg_diagnosa' },
            [this.STAGES.IDRG_PROSEDUR_SET]: { prefix: 'idrg_prosedur' },
            [this.STAGES.GROUPER_IDRG_STAGE1]: { prefix: 'grouper_idrg_stage1' },
            [this.STAGES.IDRG_GROUPER_FINAL]: { prefix: 'idrg_grouper_final' },
            [this.STAGES.IDRG_TO_INACBG_IMPORT]: { prefix: 'idrg_to_inacbg' },
            [this.STAGES.INACBG_DIAGNOSA_SET]: { prefix: 'inacbg_diagnosa' },
            [this.STAGES.INACBG_PROSEDUR_SET]: { prefix: 'inacbg_prosedur' },
            [this.STAGES.GROUPER_INACBG_STAGE1]: { prefix: 'grouper_inacbg_stage1' },
            [this.STAGES.GROUPER_INACBG_STAGE2]: { prefix: 'grouper_inacbg_stage2' },
            [this.STAGES.INACBG_GROUPER_FINAL]: { prefix: 'inacbg_grouper_final' },
            [this.STAGES.CLAIM_FINAL]: { prefix: 'claim_final' },
            [this.STAGES.SEND_CLAIM_INDIVIDUAL]: { prefix: 'send_claim' },
            [this.STAGES.GET_CLAIM_STATUS]: { prefix: 'get_claim_status' }
        };

        return stageMap[stage] || null;
    }

    /**
     * Mark workflow as completed
     * @param {string} nomor_sep - SEP number
     * @param {Object} finalData - Final claim data
     */
    static async completeWorkflow(nomor_sep, finalData = {}) {
        try {
            const updateData = {
                overall_status: this.STATUS.COMPLETED,
                current_stage: this.STAGES.SEND_CLAIM_INDIVIDUAL
            };

            // Update final data if provided
            if (finalData.tarif) {
                updateData.kode_tarif = finalData.tarif.kode_tarif;
                updateData.tarif_tarif = finalData.tarif.tarif_tarif;
                updateData.deskripsi_tarif = finalData.tarif.deskripsi_tarif;
                updateData.cbg_code = finalData.tarif.cbg_code;
                updateData.special_cmg = finalData.tarif.special_cmg;
                updateData.severity_level = finalData.tarif.severity_level;
            }

            await historyEklaim.update(updateData, { where: { nomor_sep } });
            return await historyEklaim.findOne({ where: { nomor_sep } });
        } catch (error) {
            console.error('Error completing workflow:', error);
            throw error;
        }
    }

    /**
     * Get history by SEP number
     * @param {string} nomor_sep - SEP number
     */
    static async getHistoryBySep(nomor_sep) {
        try {
            return await historyEklaim.findOne({
                where: { nomor_sep },
                include: ['tagihan']
            });
        } catch (error) {
            console.error('Error getting history by SEP:', error);
            throw error;
        }
    }

    /**
     * Check if stage can be executed based on workflow rules
     * @param {string} nomor_sep - SEP number
     * @param {number} currentStage - Stage to check
     */
    static async canExecuteStage(nomor_sep, currentStage) {
        try {
            const history = await this.getHistoryBySep(nomor_sep);
            if (!history) {
                return currentStage === this.STAGES.NEW_CLAIM; // Can start with new_claim
            }

            // Define required previous stages
            const requiredStages = {
                [this.STAGES.UPDATE_PATIENT]: [this.STAGES.NEW_CLAIM],
                [this.STAGES.SET_CLAIM_DATA]: [this.STAGES.NEW_CLAIM],
                [this.STAGES.IDRG_DIAGNOSA_SET]: [this.STAGES.SET_CLAIM_DATA],
                [this.STAGES.IDRG_PROSEDUR_SET]: [this.STAGES.IDRG_DIAGNOSA_SET],
                [this.STAGES.GROUPER_IDRG_STAGE1]: [this.STAGES.IDRG_PROSEDUR_SET],
                [this.STAGES.IDRG_GROUPER_FINAL]: [this.STAGES.GROUPER_IDRG_STAGE1],
                [this.STAGES.IDRG_TO_INACBG_IMPORT]: [this.STAGES.IDRG_GROUPER_FINAL],
                [this.STAGES.INACBG_DIAGNOSA_SET]: [this.STAGES.IDRG_TO_INACBG_IMPORT],
                [this.STAGES.INACBG_PROSEDUR_SET]: [this.STAGES.INACBG_DIAGNOSA_SET],
                [this.STAGES.GROUPER_INACBG_STAGE1]: [this.STAGES.INACBG_PROSEDUR_SET],
                [this.STAGES.GROUPER_INACBG_STAGE2]: [this.STAGES.GROUPER_INACBG_STAGE1],
                [this.STAGES.INACBG_GROUPER_FINAL]: [this.STAGES.GROUPER_INACBG_STAGE2],
                [this.STAGES.CLAIM_FINAL]: [this.STAGES.INACBG_GROUPER_FINAL],
                [this.STAGES.SEND_CLAIM_INDIVIDUAL]: [this.STAGES.CLAIM_FINAL],
                [this.STAGES.GET_CLAIM_STATUS]: [this.STAGES.SEND_CLAIM_INDIVIDUAL]
            };

            const required = requiredStages[currentStage];
            if (!required) return true; // No special requirements

            // Check if required stages are completed
            for (const reqStage of required) {
                const stageFields = this.getStageFields(reqStage);
                const stageStatus = history[`${stageFields.prefix}_status`];
                if (!stageStatus) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Error checking stage execution:', error);
            return false;
        }
    }

    /**
     * Get workflow status summary
     * @param {string} nomor_sep - SEP number
     */
    static async getWorkflowSummary(nomor_sep) {
        try {
            const history = await this.getHistoryBySep(nomor_sep);
            if (!history) return null;

            const stages = [];
            for (let stage = 1; stage <= this.STAGES.GET_CLAIM_STATUS; stage++) {
                const stageFields = this.getStageFields(stage);
                if (stageFields) {
                    stages.push({
                        stage,
                        name: stageFields.prefix,
                        status: history[`${stageFields.prefix}_status`] || false,
                        date: history[`${stageFields.prefix}_date`],
                        hasRequest: !!history[`${stageFields.prefix}_request`],
                        hasResponse: !!history[`${stageFields.prefix}_response`]
                    });
                }
            }

            return {
                nomor_sep: history.nomor_sep,
                tagihan_id: history.tagihan_id,
                current_stage: history.current_stage,
                overall_status: history.overall_status,
                error_message: history.error_message,
                kode_tarif: history.kode_tarif,
                tarif_tarif: history.tarif_tarif,
                cbg_code: history.cbg_code,
                stages,
                completed_at: history.updated_at
            };
        } catch (error) {
            console.error('Error getting workflow summary:', error);
            throw error;
        }
    }

    /**
     * Reset workflow for reprocessing
     * @param {string} nomor_sep - SEP number
     * @param {number} resetToStage - Stage to reset to
     */
    static async resetWorkflow(nomor_sep, resetToStage = 0) {
        try {
            const updateData = {
                current_stage: resetToStage,
                overall_status: this.STATUS.PENDING,
                error_message: null
            };

            // Reset all stages after resetToStage
            for (let stage = resetToStage + 1; stage <= this.STAGES.GET_CLAIM_STATUS; stage++) {
                const stageFields = this.getStageFields(stage);
                if (stageFields) {
                    updateData[`${stageFields.prefix}_request`] = null;
                    updateData[`${stageFields.prefix}_response`] = null;
                    updateData[`${stageFields.prefix}_status`] = false;
                    updateData[`${stageFields.prefix}_date`] = null;
                }
            }

            await historyEklaim.update(updateData, { where: { nomor_sep } });
            return await historyEklaim.findOne({ where: { nomor_sep } });
        } catch (error) {
            console.error('Error resetting workflow:', error);
            throw error;
        }
    }
}

module.exports = HistoryEklaimHelper;