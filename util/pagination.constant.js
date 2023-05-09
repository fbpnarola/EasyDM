module.exports = {
    PAGINATE_OPTIONS: {
        lean: true,
        leanWithId: false,
        customLabels: {
            totalDocs: 'total_entries',
            docs: 'list',
            limit: 'per_page',
            page: 'current_page',
            nextPage: 'next_page',
            prevPage: 'previous_page',
            totalPages: 'total_pages',
            pagingCounter: 'current_page',
            meta: 'pagination',
        },
    },
};