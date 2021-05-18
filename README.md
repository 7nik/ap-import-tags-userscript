A userscript to import tags from Danbooru to Anime-pictures.

# Building the userscript

Install the dependencies

```bash
cd ap-import-tags-userscript
npm install
```
then compile minified userscript:

```bash
npm run build
```

Install a script manager, e.g. [Tampermonkey](https://www.tampermonkey.net/), open it, create a new usercript, copy the content of build/userscript.min.user.js file to it, and save it.

Navigate to home page of [Anime-pictures](https://anime-pictures.net/), open the side menu, and click "Import tags".

# Developing and debugging

To create an non-minified version of the usercript:

```bash
npm run build
```
It will automatically rebuild the script on change of source files.