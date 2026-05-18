# Midsommarmilen

Hoppa över midsommarstängerna! A Swedish midsummer endless runner for the party.

**Live game:** https://gustavjonemo.github.io/midsommarmilen

Press **Space** or **tap** to jump.

---

## Admin setup — Google Sheets score tracking

Do this once before sharing the link with guests. Players never touch any of this.

### 1. Create the spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it **Midsommarpoäng** (or whatever you like)
3. Add headers in row 1: **Timestamp** | **Name** | **Score**

### 2. Add the Apps Script

1. In the spreadsheet: **Extensions → Apps Script**
2. Delete any existing code and paste this:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.appendRow([new Date(), e.parameter.name, parseInt(e.parameter.score)]);
  return ContentService.createTextOutput('ok');
}
```

3. Click **Save** (give it any project name)
4. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Authorize access** and follow the Google prompts
6. Click **Deploy** and copy the **Web app URL**

### 3. Add the URL to the game

Open `game.js` and replace line 2:

```js
const APPS_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';
```

with your URL:

```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID_HERE/exec';
```

Commit and push — every round played will now silently add a row to your sheet.
