const { getGoogleSheetsData } = require("../../lib/google-sheets")

module.exports = async () => {
  try {
    console.log("Fetch data from: google-sheets...")
    const res = await getGoogleSheetsData('themes')

    // Main objects
    const tagsForThemes = {}
    const namesArr = [];
    const tagsArr = [];

    res.values.forEach((el, id) => {
      if (!id || !Array.isArray(el) || el.length < 2) return

      const name = el[0].toLowerCase()
      const searchTags = el[1]
        .replace(/(\r\n|\n|\r)/gm, ",")
        .split(",")
        .map(tag => tag.trim().toLowerCase())
      const youtubeId = el[2] || 'sGpPgQeEyOc'

      namesArr.push(name)

      searchTags.forEach(tag => {
        if (tag.length !== 0) {
          tagsForThemes[tag] = tagsForThemes[tag] || { themes: [] }
          tagsForThemes[tag].themes.push(name)
          tagsForThemes[tag].youtubeId = youtubeId
        }

        if (!tagsArr.includes(tag) && tag.length !== 0) {
          tagsArr.push(tag);
        }
      })

      // Second object to compare
      const tagsForThemesByWord = {}

      searchTags.forEach(tag => {
        if (tag.length !== 0) {
          const words = tag.split(" ")
          words.forEach(word => {
            tagsForThemesByWord[word] = tagsForThemesByWord[word] || { themes: [] }
            tagsForThemesByWord[word].themes.push(name)
            tagsForThemesByWord[word].youtubeId = youtubeId
          })
        }
      })

      // Loop through each tag in tagsForThemes
      for (let tag in tagsForThemes) {
        // Loop through each word in tagsForThemesByWord
        for (let word in tagsForThemesByWord) {
          // If the tag and word share at least one word in common
          if (tag.includes(word) || word.includes(tag)) {
            // Loop through each theme in tagsForThemesByWord[word]
            tagsForThemesByWord[word].themes.forEach(theme => {
              // If the theme is not already in tagsForThemes[tag].themes, add it
              if (!tagsForThemes[tag].themes.includes(theme)) {
                tagsForThemes[tag].themes.push(theme)
              }
            })
          }
        }
      }

      // Remove duplicates from each tag's themes array
      for (let tag in tagsForThemes) {
        tagsForThemes[tag].themes = [...new Set(tagsForThemes[tag].themes)]
      }
    })

    // If the length of the themes array for each element is less than 2, add similar themes from other objects to enrich the list of topics
    tagsArr.forEach(tag => {
      if (tagsForThemes[tag].themes.length < 2) {
        const matchingThemes = Object.values(tagsForThemes).find(theme => theme.themes.length > 8 && theme.themes !== tagsForThemes[tag].themes);

        if (matchingThemes) {
          const similarThemes = matchingThemes.themes.slice(0, 8);
          tagsForThemes[tag].themes.push(...similarThemes);
        }
      }
    });

    return tagsForThemes
  } catch (error) {
    console.error(error)
  }
}