exports.up = (knex, Promise) => (async() =>  {
    await knex.schema.table('templates', table => {
        table.text('data', 'longtext');
        table.string('type');
    });

    const templates = await knex('templates');

    for (const template of templates) {
        let type = template.editor_name;
        const data = JSON.parse(template.editor_data || '{}');

        if (type == 'summernote') {
            type = 'ckeditor';
        }

        if (type == 'mosaico') {
            type = 'mosaicoWithFsTemplate';
            data.mosaicoFsTemplate = data.template;
            delete data.template;
        }

        await knex('templates').where('id', template.id).update({type, data: JSON.stringify(data)});
    }

    await knex.schema.table('templates', table => {
        table.dropColumn('editor_name');
        table.dropColumn('editor_data');
    });
})();

exports.down = (knex, Promise) => (async() =>  {
})();
