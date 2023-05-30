const moment = require('moment')
exports.month_year_wise_data = async (data, dateField, cntField) => {
    try {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        var dateFrom = moment(firstDay).subtract(1, 'years')
        let lastMonth, historyData = []
        for (let i = 1; i <= 12; i++) {
            let nextMonth = moment(dateFrom).add(i, 'months')
            lastMonth = moment(nextMonth).subtract(1, 'months')
            const month = moment(lastMonth).format('MMM').toString();
            const year = moment(lastMonth).format('YYYY').toString();
            let hoursCnt = 0
            data.forEach(element => {
                element.info.forEach(element1 => {
                    let finalField, finalCntField
                    Object.entries(element1).forEach(([key, val]) => {
                        if (key === dateField) {
                            finalField = val
                        }
                        if (key === cntField) {
                            finalCntField = val
                        }
                    });
                    if (finalField >= lastMonth && finalField <= nextMonth) {
                        hoursCnt = hoursCnt + finalCntField
                    }
                });
            });
            historyData.push({ month: `${month}-${year}`, totalCount: hoursCnt })
        }
        return historyData
    } catch (error) {
        return error
    }
}

exports.month_year_wise_data_model = async (model, conditionFields, cntField) => {
    try {
        const finalData = []
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        var dateFrom = moment(firstDay).subtract(1, 'years')
        let lastMonth
        for (let i = 1; i <= 12; i++) {
            let nextMonth = moment(dateFrom).add(i, 'months')
            lastMonth = moment(nextMonth).subtract(1, 'months')
            const month = moment(lastMonth).format('MMM')
            const year = moment(lastMonth).format('YYYY');
            const betweenDate = { $lte: nextMonth, $gt: lastMonth }
            let count = 0, finalCntField = 0
            conditionFields.push({ monthYear: betweenDate })
            const monthWise = await model.find({ $and: conditionFields })
            monthWise.forEach(element => {
                Object.entries(element._doc).forEach(([key, val]) => {
                    if (key === cntField) {
                        finalCntField = val
                    }
                });
                count = count + finalCntField
            });
            finalData.push({ month: `${month} - ${year}`, totalCount: count })
            conditionFields.pop()
        }
        return finalData
    } catch (error) {
        return error.message
    }
}