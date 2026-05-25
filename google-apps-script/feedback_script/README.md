# SkillScope Feedback Form - Google Apps Script Setup

This guide will walk you through setting up a Google Sheet and a Google Apps Script to collect feedback from the SkillScope application and automatically email a weekly report.

## Step 1: Create a Google Sheet

1.  Go to [sheets.google.com](https://sheets.google.com).
2.  Create a new **Blank spreadsheet**.
3.  Rename the spreadsheet to something memorable, like `SkillScope Feedback`.
4.  The script will automatically create a sheet named "Feedback" with the correct headers, so no further setup is needed here.

## Step 2: Create the Google Apps Script

1.  In your new Google Sheet, go to **Extensions > Apps Script**. This will open a new tab with the Apps Script editor.
2.  Delete any placeholder code in the `Code.gs` file.
3.  Copy the entire content of the `Code.gs` file from this directory and paste it into the script editor.
4.  **Important:** Near the top of the script, you can change the `RECIPIENT_EMAIL` if you want the report sent to a different address. The default is `contact.skillscope@gmail.com`.
5.  Save the project by clicking the floppy disk icon (💾) or pressing `Ctrl + S`. Give it a name like "SkillScope Feedback Handler".

## Step 3: Deploy the Script as a Web App

This makes your script accessible from the internet so the website can send data to it.

1.  At the top right of the Apps Script editor, click the **Deploy** button and select **New deployment**.
2.  Click the gear icon (⚙️) next to "Select type" and choose **Web app**.
3.  Fill in the deployment configuration:
    *   **Description:** `SkillScope Feedback Form Handler`
    *   **Execute as:** `Me` (your Google account)
    *   **Who has access:** `Anyone` (This is crucial for the form to work)
4.  Click **Deploy**.
5.  Google will ask you to authorize the script. Click **Authorize access**.
6.  Choose your Google account. You might see a "Google hasn't verified this app" warning. This is normal for your own scripts. Click **Advanced**, then click **Go to [Your Script Name] (unsafe)**.
7.  Review the permissions and click **Allow**.
8.  After authorizing, a "Deployment successfully updated" window will appear. **Copy the Web app URL**. It will look something like `https://script.google.com/macros/s/.../exec`.

## Step 4: Configure the Website with Your URL

To protect your Web App URL, it should be set as an environment variable.

1.  In your project's environment configuration (e.g., a `.env` file or your hosting provider's settings), create a new variable named `FEEDBACK_SCRIPT_URL`.
2.  Set the value of this variable to the **Web app URL** you copied in the previous step.
3.  For example, in a `.env` file, it would look like this:
    `FEEDBACK_SCRIPT_URL=https://script.google.com/macros/s/.../exec`
4.  Save your environment configuration and restart your application if necessary. Your feedback form is now live and will record submissions in your Google Sheet!

## Step 5: Set Up the Automated Weekly Email Trigger

This will run the `sendWeeklyFeedbackReport` function automatically every week.

1.  In the Apps Script editor, click on the **Triggers** icon (a clock ⏰) on the left sidebar.
2.  Click the **+ Add Trigger** button in the bottom right.
3.  Configure the trigger with the following settings:
    *   **Choose which function to run:** `sendWeeklyFeedbackReport`
    *   **Choose which deployment should run:** `Head`
    *   **Select event source:** `Time-driven`
    *   **Select type of time based trigger:** `Week timer`
    *   **Select day of week:** `Every Sunday` (or your preferred day)
    *   **Select time of day:** `1am - 2am` (or your preferred time)
4.  Click **Save**. You may need to authorize the script again for the new permissions (sending email on your behalf).

**That's it!** Your system is now fully configured. New feedback will be added to your Google Sheet in real-time, and you will receive an Excel report via email once a week.
