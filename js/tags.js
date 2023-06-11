const { getGoogleSheetsData } = require("../../lib/google-sheets")

module.exports = async () => {
  try {
    console.log("Fetch data from: google-sheets...")
    const res = await getGoogleSheetsData()

    // Main obj
    const tagsForThemes = {}

    res.values.forEach((el, id) => {
      if (!id || !Array.isArray(el)) return

      const name = el[0].toLowerCase()
      const searchTags = el[1]
        .replace(/(\r\n|\n|\r)/gm, ",")
        .split(",")
        .map(tag => tag.trim().toLowerCase())
      const youtubeId = el[2]

      searchTags.forEach(tag => {
        if (tag.length !== 0) {
          tagsForThemes[tag] = tagsForThemes[tag] || { themes: [] }
          tagsForThemes[tag].themes.push(name)
          tagsForThemes[tag].youtubeId = youtubeId
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
          // If the tag and word share at least one word in common and merging two arrays into one and removing duplicates from the merged array
          if (tag.includes(word) || word.includes(tag)) {
            tagsForThemes[tag].themes = [...new Set([...tagsForThemes[tag].themes, ...tagsForThemesByWord[word].themes])]
          }
        }
      }
    })
    return tagsForThemes
  } catch (error) {
    console.error(error)
  }
}