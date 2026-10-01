# Incognito ChatGPT

A private window around the real ChatGPT website. There is **no API key** and **no account on this app**.

It works the same way as opening https://chatgpt.com in a browser incognito tab:

- ChatGPT itself is what you talk to (including image upload)
- This app does not store cookies, chats, or login state
- **New incognito tab** deletes the in-memory session and loads ChatGPT as a new visitor
- On quit, the temporary profile folder is deleted

## Install as a Windows app

```bash
npm install
npm run install-shortcuts
```

That puts **Incognito ChatGPT** on your Desktop and in the Start menu. Double-click it like any other program (no terminal needed).

To build a standalone `.exe` installer and a portable app in `release/`:

```bash
npm run dist
```

Then run `Incognito ChatGPT Setup.exe` or `Incognito-ChatGPT.exe`.

## Run from the repo

```bash
npm start
```

## Privacy, plainly

This is as private as ChatGPT-in-incognito, not more:

- OpenAI still receives whatever you type or upload
- Your IP is still visible to them
- If ChatGPT’s website asks you to sign in, that is OpenAI’s gate — this app cannot invent a free anonymous model

An API key was worse for this goal because it is tied to *your* OpenAI account. This wrapper does not use one.
