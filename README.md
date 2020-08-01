## Electron Hote-Reload With No External Dependencies

**Run It**  
* `git clone https://github.com/jehunter5811/electron-hot-reload`  
* `cd electron-hot-reload`  
* `npm install`  
* `npm start`  

**The Story & Tutorial** 

I have built Electron apps before, but I wanted to challenge myself to build one without any tutorial and by reading the Electron docs only (and some Stackoverflow, of course). I also wanted to challenge myself to use HTML, CSS, and Vanilla JavaScript. No React. No external libraries. 

I immediately ran into a problem. 

While developing, I have become accustomed to hot-reload—the automatic refreshing of the content on the screen after I've made changes. You don't get that out of the box with Electron, so I set out to solve it without adding any dependencies. Turns out, it was pretty simple. 

The first thing you'll need to do is setup a new Electron project. That's as simple as following their quickstart docs, but I'll outline it here so you don't have to jump between tabs. My instructions are focused on MacOS, but Windows people, I think you can map them to Windows instructions pretty easily. 

From the Terminal, create a new folder: `mkdir electron-hot-reload`. 

Then, change into that directory: `cd electron-hot-reload`.

Now, you'll need to initialize the directory with `npm init`. Answer the questions that you're prompted to answer. When you're done with that, you'll need to install Electron: 

`npm i --save-dev electron`

Now, open your directory in your favorite code editor. You'll need to possibly make a change depending on how you set things up when running `npm init`. Check your `package.json` file and see what file name is indicated in the `main` property. I am using `main.js` for my project, so if you'd like to do that again, make sure your package.json looks like this: 

```
{
  "name": "electron-hot-reload",
  "version": "0.0.1",
  "description": "A simple hot-reload example for Electron",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "electron": "^9.1.2"
  }
}
```

Now, you can create the `main.js` file. In your Terminal, run `touch main.js && touch index.html`. This will create an empty JavaScript file called `main.js` and it will create the empty file that will host our front-end code. Time to write some code!

In your `main.js` file, add this: 

```
const { app, BrowserWindow, ipcRenderer, ipcMain } = require('electron')

let win;

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')
}

app.whenReady().then(createWindow)
```

You might be asking why we define the `win` variable outside of the `createWindow` function but never use it again or reassign it outside that function. Don't worry, we will. Let's get our HTML file set up and make sure Electron runs before we work on the hot reload. 

In your `index.html` file, add this simple boilerplate: 

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Hello World!</title>
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline';" />
  </head>
  <body>
    <h1>Hello World!</h1>
    <p>This is a simple hot-reload example for Electron.</p>
  </body>
</html>
```

Now, to run the app. Go back to your `package.json` file. There, you'll see a `scripts` section. Let's add a start script so that section looks like this: 

```
  "scripts": {
    "start": "electron ."
  },
```

Save that, then back in your Terminal run `npm start`. Electron should open your new desktop app with the HTML content we included displayed.

Awesome! But now, make a change to that HTML. Nothing happened, right? To see the change, we have to close the app then start it again. That's not very efficient. Let's solve that with hot-reload. 

The first thing we need to do is close the app and create a new file called `watcher.js`. You can do that manually or in the Terminal by running `touch wathcer.js`. Before we forget, let's make sure we wire that file up to our `index.html` file so it gets loaded on start. Right before the closing `body` tag in your `index.html` add this: 

`<script src='./watcher.js'></script>`

Now, we can add some code to the `watcher.js` file. Remember, the hot-reload functionality we're building will use no external dependencies. We will simply make use of the built-in Node Filesystem and what we get out of the box with Electron. In your `watcher.js` file, add the following: 

```
const fs = require('fs');

(async () => {
  const watcher = fs.watch('./index.html');
  watcher.on('change', () => {
    console.log('changed')
  });
})();
```

Not much going on in this file, but let's walk through it. We're using Node's built-in file system to watch for changes to whatever file we define. In this case, we are defining that file to be our `index.html` file, but you could see how we might be able to define multiple different files to watch for our hot-reload system. The watcher event handler just listens for changes to the file we defined, and, for now, it console.logs the word "changed". 

Now, if you run your Electron app (`npm start`) and open the developer tools window in your app (click View -> Toggle Developer Tools), and look in the console of the developer tools window, you will be able to watch for changes. Let's try it. In your `index.html` file, change the heading to say "Hello Electron!". When you save it, you should see in the console of the developer tools window, the word "changed" is printed. 

Now, all we need to do is actually update the app to show our changes rather than logging out a word. Close the app, and let's finish this thing up. 

Back in your `watcher.js` file, let's import the `ipcRenderer` helper from Electron. At the top of the file add this: 

`const { ipcRenderer } = require('electron');`

Then, inside the listener we set up, replace the console.log with `ipcRenderer.send('re-render');`. That's it for our watcher file. Now, we need to tell Electron what to do when it receives the 're-render' command. 

Open up your `main.js` file, and add the `ipcMain` import to your other Electron imports: 

`const { app, BrowserWindow, ipcMain } = require('electron')`

Now, beneath the `createWindow` function, add the following: 

```
ipcMain.on('re-render', () => {
  win.loadFile('index.html')
})
```

Remember, I told you we'd re-assign that `win` variable. Well, here you go. We are telling Electron to listen for a 're-render' message. When that message comes through, we are simply reloading our `index.html` file. 

That's it. Run your app again, make a change to the `index.html` file, and you'll see your change immediately in your app window. Pretty cool, right? 

We did this all without Webpack or any other bundling libraries. There are plenty of options for creating hot-reload in Electron (and other apps), but if you need a lightweight solution, this may be the right choice for you. 

If you enjoyed this tutorial, please consider [subscribing for free to my site](https://polluterofminds.com) where I talk about non-traditional paths to coding, technology, and pretty much anything else I like. 
