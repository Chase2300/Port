const gulp = require('gulp'),
    dom = require('gulp-dom');
const { src, dest } = require('gulp');
const path = require('path');
const dotenv = require("dotenv").config();
const jsonObject = require('./configGulp.json')
const through2 = require('through2');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

gulp.task('translate', function (cb) {
    return src(jsonObject.paths)
        .pipe(through2.obj(function (file, enc, callback) {
            Promise.all(translateDocument(file)).finally(() => {
                callback();
            })
        }))
        .on("end", cb);
})

gulp.task('ai', function () {
    return src(jsonObject.dest)
        .pipe(through2.obj(function (file, enc, callback) {
            const dom = new JSDOM(file.contents);
            const document = dom.window.document;
            let rewriteElems = [...document.querySelectorAll("q[data-rw]:not([rw='no'])")]
            rewriteElems = rewriteElems.filter(elm => !elm.closest("[rw='no']"))
            rewriteElems = rewriteElems.filter(el => {
                return !rewriteElems.some(item => el.parentNode === item)
            });
            const batches = [];
            // batchSize && delayIncrement are chosen experimentally(reduce batchSize, increase delayIncrement). Avoid 429 mistake.
            const batchSize = 3;
            const delayIncrement = 3000;
            let delay = 0;
            const promiseArr = [];

            console.log(`Process started - ${file.basename}`)

            if (rewriteElems.length === 0) {
                console.log("Items not found. Move on to the next file")
            }

            for (let i = 0; i < rewriteElems.length; i += batchSize) {
                const batch = rewriteElems.slice(i, i + batchSize);
                batches.push(batch);
            }

            console.log(`Batch size: ${batchSize} Total batches: ${batches.length} Delay: ${delayIncrement}`);


            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                const messages = batch.map(el => {
                    const promptValue = el.dataset.rw || jsonObject.openAi_prompt;
                    const content = `${promptValue}\n${el.textContent || ''}\n`;
                    return { role: 'user', content };
                });

                promiseArr.push(new Promise(resolve => setTimeout(resolve, delay)).then(() => {
                    console.log(`Batch #${i+1}(${batches.length}) rewriting...`);
                    return new Promise ((resolve, reject) => {
                        let batchTimer = new Date().getTime();
                        const batchPromises = batch.map((el, j) => {
                            return ai.start({
                                /* you options */
                            }).then(result => {
                                el.outerHTML = result.data;
                            }).catch(err => {
                                console.log(err.message);
                            });
                        });
                        Promise.all(batchPromises).then(resolve);
                    })
                }));

                delay += delayIncrement;
            }

            Promise.all(promiseArr).then(() => {
                file.contents = Buffer.from(dom.serialize());
                this.push(file);
                console.log(`Process successfully - ${file.basename}`);
                callback();
            });
        }))
        .pipe(dest(jsonObject.dest.replace(/(\*\*)?\/\*\.html$/, "")));
});

gulp.task('updateTime', function () {
    return src(jsonObject.dest)
        .pipe(through2.obj(function (file, enc, callback) {
            const dom = new JSDOM(file.contents);
            const document = dom.window.document;
            const timeTag = document.querySelector("time[itemprop='dateModified']")
            let date = new Date()

            try {
                timeTag.setAttribute("datetime", date.toISOString())
                timeTag.textContent = `${date.getFullYear()}-${date.getMonth() + 1}-${('0' + date.getDate()).slice(-2)}`
            } catch (error) {
                throw new Error(`something wrong - ${error}`)
            }

            file.contents = Buffer.from(dom.serialize());
            this.push(file);
            callback();
        }))
        .pipe(dest(jsonObject.dest.replace(/\/?\*\*?\/\*.html/g, "")));
});

gulp.task('copyWithChanges', function () {
    return src(jsonObject.paths)
        .pipe(through2.obj(function (file, enc, callback) {
            const dom = new JSDOM(file.contents);
            const document = dom.window.document;

            changeAssets(file, document);
            checkAiLanguage(file, document);

            file.contents = Buffer.from(dom.serialize());
            this.push(file)
            callback()
        }))
        .pipe(dest('./u_dest'))
})

function translateDocument(file) {
    let promiseArr = [];
    try {
        for (let i in jsonObject.languages) {
            {
                try {
                    fs.mkdirSync(`${file.base}/${jsonObject.languages[i]}`);
                } catch (err) { };
                try {
                    fs.rmSync(`${file.base}/${jsonObject.languages[i]}/${file.basename}`);
                    fs.rmSync(`${file.base}/en/${file.basename}`);
                } catch (err) { };

                promiseArr.push(
                    /* you code */
                )
            }
        }

    } catch (error) {
        // If the error occurs after the document was already uploaded,
        // documentHandle will contain the document ID and key
        if (error.documentHandle) {
            const handle = error.documentHandle;
            console.log(`Document ID: ${handle.documentId}, ` + `Document key: ${handle.documentKey}`);
        } else {
            console.log(`Error occurred during document upload: ${error}`);
        }
    }
    return promiseArr;
}

function changeAssets(file, document) {
    const assetPrefix = "assets52";
    const allAssets = Array.from(document.querySelectorAll(`[href^='${assetPrefix}']`));
    allAssets.forEach(asset => {
        const newAssets = asset.getAttribute("href").replace(assetPrefix, "../assets52");
        asset.setAttribute("href", newAssets);
    });
}

function checkAiLanguage(file, document) {
    let phrases = jsonObject.check_AI_model;

    function removePhrases(node) {
        if (node.nodeType === 3) {
            for (let phrase of phrases) {
                const regex = new RegExp(phrase, 'gi');
                node.textContent = node.textContent.replace(regex, '');
            }
        } else if (node.nodeType === 1) {
            for (let i = 0; i < node.childNodes.length; i++) {
                removePhrases(node.childNodes[i]);
            }
        }
    }

    removePhrases(document.body);
}

gulp.task('default', gulp.series('changeAssets', 'copyWithChanges'));
gulp.task('rw', gulp.series('updateTime', "ai"));

