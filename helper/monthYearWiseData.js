const moment = require('moment')
exports.month_year_wise_data = async (data, dateField, cntField) => {
    try {
        const historyData = []
        var dateFrom = moment().subtract(1, 'year').startOf('month').format('YYYY-MM-DD hh:mm')
        let lastMonth
        for (let i = 1; i <= 12; i++) {
            let nextMonth = moment(dateFrom).add(i, 'months')
            lastMonth = moment(nextMonth).subtract(1, 'months')
            const month = moment(lastMonth).format('MMM').toString();
            const year = moment(lastMonth).format('YYYY').toString();
            let hoursCnt = 0
            data.forEach(element => {
                element.info.forEach(element1 => {
                    if (element1[dateField] >= lastMonth && element1[dateField] <= nextMonth) {
                        hoursCnt = hoursCnt + element1[cntField]
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

exports.month_year_wise_data_model = async (model, conditionArray, dateField, cntField) => {
    try {
        const finalData = []
        var dateFrom = moment().subtract(1, 'year').startOf('month').format('YYYY-MM-DD hh:mm')
        let lastMonth
        for (let i = 1; i <= 12; i++) {
            let nextMonth = moment(dateFrom).add(i, 'months')
            lastMonth = moment(nextMonth).subtract(1, 'months')
            const month = moment(lastMonth).format('MMM')
            const year = moment(lastMonth).format('YYYY');
            const betweenDate = { $lte: nextMonth, $gt: lastMonth }
            let count = 0
            conditionArray.push({ [dateField]: betweenDate })
            const monthWise = await model.find({ $and: conditionArray })
            monthWise.forEach(element => {
                count = count + element[cntField]
            });
            finalData.push({ month: `${month} - ${year}`, totalCount: count })
            conditionArray.pop()
        }
        return finalData
    } catch (error) {
        return error.message
    }
}