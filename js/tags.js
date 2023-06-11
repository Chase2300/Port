const { getGoogleSheetsData } = require("../../lib/google-sheets");

module.exports = async () => {
  try {
    console.log('Fetch data from: google-sheets...');
    const res = await getGoogleSheetsData();

    const tagsForThemes = {};

    res.values.forEach((el, id) => {
      if (!id || !Array.isArray(el)) return;

      const name = el[0].toLowerCase();
      const searchTags = el[1].replace(/(\r\n|\n|\r)/gm, ',').split(',').map((tag) => tag.trim().toLowerCase());
      const youtubeId = el[2];

      searchTags.forEach((tag) => {
		if (tag.length !== 0) {
			if (!tagsForThemes[tag]) {
			  tagsForThemes[tag] = { themes: [] };
			}
			tagsForThemes[tag].themes.push(name);
			tagsForThemes[tag].youtubeId = youtubeId;
		  }
      });
    });
    return tagsForThemes;
  } catch (error) {
    console.error(error);
  }
};