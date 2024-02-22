const gulp = require('gulp'),
    dom = require('gulp-dom');
const { src, dest } = require('gulp');
const jsonObject = require('./configGulp.json')
const parallel = require('./src/lib/parallel').config({ concurrency: jsonObject.parallelTaskLimit })
const path = require('path');
const deepl = require('deepl-node');
const dotenv = require("dotenv").config();
const through2 = require('through2');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPEN_API_KEY,
    organization: "org-R5tCrEI4ZDERRNzSpGAqyldL",
});
const openai = new OpenAIApi(configuration); 
const gpt3 = "gpt-3.5-turbo-0125";
const gpt4 = "gpt-4-0125-preview";
const translate = false; // choose whether translation is needed when generating njk templates into the desired language or not

const DEEPL_KEY = process.env.DEEPL_KEY;
const translator = new deepl.Translator(DEEPL_KEY);

let isConsoleLogged = false;

gulp.task('translate', function (cb) {
    return src(jsonObject.paths)
        .pipe(through2.obj(function (file, enc, callback) {
            Promise.all(translateDocument(file)).finally(() => {
                callback();
            })
        }))
        .on("end", cb);
})

gulp.task('translateMeta', function () {
    return src(`./dist/mobirise/html-lands/*(${jsonObject.languages.join('|')})/*.html`)
        .pipe(through2.obj(function (file, enc, callback) {
            const lang = file.relative.split(path.sep).shift();
            const dom = new JSDOM(file.contents);
            const document = dom.window.document;
            const meta = document.querySelector("meta[name='description']");

            if (!meta) {
                throw new Error('const "meta" is not found in document')
            }
            /* translator.translateText(`${meta.content}`, null, `${lang.replace('pt', 'pt-PT')}`)
                .then(translate => {
                    meta.content = translate.text
                    file.contents = Buffer.from(dom.serialize());
                    this.push(file);
                    callback();
                }) */

        }))
        .pipe(dest(`./dist/mobirise/html-lands/`));
});

gulp.task('addLinks', function () {
    return src(`./dist/mobirise/html-lands/*(${jsonObject.languages.join('|')})/*.html`)
        .pipe(through2.obj(function (file, enc, callback) {
            const dom = new JSDOM(file.contents);
            const document = dom.window.document;

            addLinksToDropdownMenu(file, document);
            addLinksToHead(file, document);

            file.contents = Buffer.from(dom.serialize());
            this.push(file);
            callback();

        }))
        .pipe(dest(`./dist/mobirise/html-lands/`));
});

gulp.task('changeAssets', function () {
    return src(`./dist/mobirise/html-lands/*(${jsonObject.languages.join('|')})/*.html`)
        .pipe(through2.obj(function (file, enc, callback) {
            const dom = new JSDOM(file.contents);
            const document = dom.window.document;

            changeAssets(file, document);

            file.contents = Buffer.from(dom.serialize());
            this.push(file);
            callback();

        }))
        .pipe(dest(`./dist/mobirise/html-lands/`));
});

gulp.task('copyFilesWithChanges', function () {
    return src(jsonObject.paths)
        .pipe(through2.obj(function (file, enc, callback) {
            const dom = new JSDOM(file.contents);
            const document = dom.window.document;

            addLinksToDropdownMenu(file, document);
            addLinksToHead(file, document);
            changeAssets(file, document);
            delWrongPhrases(file, document);

            file.contents = Buffer.from(dom.serialize());
            this.push(file)
            callback()
        }))
        .pipe(dest('./dist/mobirise/html-lands/en'))
})

gulp.task('delWrongPhrases', function () {
    return src('./dist/mobirise/html-lands/**/*.html')
        .pipe(through2.obj(function (file, enc, callback) {
            const dom = new JSDOM(file.contents);
            const document = dom.window.document;

            delWrongPhrases(file, document);

            file.contents = Buffer.from(dom.serialize());
            this.push(file)
            callback()
        }))
        .pipe(dest('./dist/mobirise/html-lands'))
})

gulp.task('openAi', function () {
    let counter = 1;

    return src(jsonObject.rewrite_dest)
        .pipe(parallel(function (file, enc, callback) {
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
            const delayIncrement = 100;
            let delay = 0;
            const promiseArr = [];

            console.log(`Rewriting started - ${file.basename}`)

            if (rewriteElems.length === 0) {
                console.log("Rewrite items not found. Move on to the next file")
            }

            for (let i = 0; i < rewriteElems.length; i += batchSize) {
                const batch = rewriteElems.slice(i, i + batchSize);
                batches.push(batch);
            }

            console.log(`Batch size: ${batchSize}, Total batches: ${batches.length}, Delay: ${delayIncrement}, File counter: ${counter}`);
            counter++;
            
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                const messages = batch.map(el => {
                    const promptValue = el.dataset.rw;
                    let content = `${promptValue}\n${el.textContent}\nYou do not include any explanation`;

                    if (!el.dataset.rw && translate) {
                       content = `${jsonObject.openAi_translatePromptForText}\n${el.textContent}`
                    }
                    if (el.dataset.rw && translate) {
                       content = `${promptValue}\n${jsonObject.openAi_translatePromptForHtml}`
                    }
                    return { role: 'user', content };
                });

                promiseArr.push(new Promise ((resolve, reject) => {
                    const batchPromises = batch.map((el, j) => {
                        const promptValue = el.dataset.rw;                        
                            return openai.createChatCompletion({
                                model: gpt4,
                                messages: [messages[j]],
                                temperature: 1,
                                max_tokens: 4000,
                                frequency_penalty: 0,
                                presence_penalty: 0,
                            }).then(result => {
                                el.outerHTML = result.data['choices'][0]['message']['content'];
                            }).catch(err => {
                                console.log(err.message);
                            });
                    });
                    Promise.all(batchPromises).then(resolve);
                }));

                delay += delayIncrement;
            }

            Promise.all(promiseArr).then(() => {
                file.contents = Buffer.from(dom.serialize());
                this.push(file);
                console.log(`Rewriting successfully - ${file.basename}`);
                callback();
            });
        }))
        .pipe(dest(jsonObject.rewrite_dest.replace(/(\*\*)?\/\*\.html$/, "")));
});

gulp.task('updateTime', function () {
    return src(jsonObject.rewrite_dest)
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
        .pipe(dest(jsonObject.rewrite_dest.replace(/\/?\*\*?\/\*.html/g, "")));
});

function translateDocument(file) {
    let promiseArr = [];
    try {
        for (let i in jsonObject.languages) {
            {
                const sourcePath = `${file.path}`;
                const destinationPath = `${file.base}/${jsonObject.languages[i]}/${file.basename}`;

                try {
                    fs.mkdirSync(`${file.base}/${jsonObject.languages[i]}`);
                } catch (err) { };
                try {
                    fs.rmSync(`${file.base}/${jsonObject.languages[i]}/${file.basename}`);
                    fs.rmSync(`${file.base}/en/${file.basename}`);
                } catch (err) { };        
                
                // for GPT translate
                fs.copyFileSync(sourcePath, destinationPath);
                
                /* promiseArr.push(
                    translator.translateDocument(
                        `${file.path}`,
                        `${file.base}/${jsonObject.languages[i]}/${file.basename}`,
                        'en',
                        `${jsonObject.languages[i].replace('pt', 'pt-PT')}`
                    )
                ) */
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

function delWrongPhrases(file, document) {
    let phrases = jsonObject.wrong_phrases;

    function removePhrases(node) {
        if (node.nodeType === 3 && node.parentElement.tagName !== 'SCRIPT') {
            for (let phrase of phrases) {
                const regex = new RegExp(phrase, 'gi');
                node.textContent = node.textContent.replace(regex, '');
            }
            node.textContent = node.textContent.replace(/"|«|»/g, '');
        }
        if (node.tagName === 'LINK' || node.tagName === 'A') {
            let href = node.getAttribute('href');
            if (href && href.includes('index.html')) {
                href = href.replace('index.html', '');
                node.setAttribute('href', href);
            }
        }
        if (node.nodeType === 1 && node.tagName !== 'SCRIPT') {
            for (let i = 0; i < node.childNodes.length; i++) {
                removePhrases(node.childNodes[i]);
            }
        }
    }

    [document.body, document.head].forEach(removePhrases);
}

gulp.task('default', gulp.series(
    'translate', /* 'translateMeta', */
    /* 'addLinks', */
    'changeAssets',
    "delWrongPhrases",
    'copyFilesWithChanges'
));
gulp.task('rw', gulp.series('updateTime', "openAi", "delWrongPhrases"));
gulp.task('titleRw', gulp.series("delWrongPhrases"));
gulp.task('tr', gulp.series("openAi", 'translate', /* 'addLinks',  */'changeAssets', "delWrongPhrases", 'copyFilesWithChanges'));

