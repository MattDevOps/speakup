# SpeakUp!

English speaking practice for Hebrew speakers (Sara, Shira, Shlomo). The whole
interface is in Hebrew; only the words being learned are in English. Static
site, no build step.

## Files

| File | What it holds |
|---|---|
| `index.html` | Page markup for the app |
| `styles.css` | All styles (right-to-left layout) |
| `content.js` | Users, levels, lessons, personal phrases. Shared with the dashboard |
| `speech.js` | Text-to-speech, voice settings, microphone, answer matching |
| `app.js` | State, storage, navigation, name/level/lesson-list screens |
| `lesson.js` | Flashcard screen (listen and repeat) |
| `quiz.js` | Quiz and results screens |
| `help.js` | Hebrew instructions: per-screen hint line and the full guide |
| `util.js` | Small helpers shared by both pages |
| `users.js` | Built-in plus added users, and the add-user window |
| `events.js` | Names of the usage events, shared by app and dashboard |
| `tracking.js` | Usage events sent to Firebase (URL is set at the top) |
| `dashboard.html`, `dashboard.css` | Parent dashboard page (English) |
| `dashboard-data.js` | Dashboard numbers: pure functions over the event list |
| `dashboard.js` | Dashboard connection and HTML |

## Adding or editing words

Edit `content.js`. Each word has four fields:

- `e` English
- `h` Hebrew meaning
- `p` how to say it, English sounds written in Hebrew letters
- `x` English example sentence

The dashboard builds its lesson list from `content.js`, so nothing else needs
to change.

## Users

Built-in users are listed in `USERS` in `content.js` and appear on every
device. Users added with the in-app button are stored in that browser only
(`localStorage` key `su_users_v1`); the dashboard learns their name from their
login events.

## Run locally

```
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765/. Tracking is switched off automatically on
localhost, so local testing does not reach the live Firebase database.

## Deploy (Netlify)

Upload the whole folder (or a zip of it), not `index.html` alone. The app no
longer works as a single file.
