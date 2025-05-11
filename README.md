# MediMate - Your Smart Medication Assistant 💊

MediMate is a user-friendly web application designed to help you manage your medication schedule with ease and precision. Never miss a dose again!

## 👋 About The Project

This application aims to provide a simple yet powerful tool for individuals to track their medications, dosages, and schedules. It's built with modern web technologies to ensure a smooth and responsive experience.

**Built With:**
*   Next.js (App Router)
*   React
*   TypeScript
*   Tailwind CSS
*   ShadCN UI Components
*   Lucide React (Icons)
*   date-fns (Date utility)
*   Zod (Schema validation)
*   React Hook Form
*   Genkit (for upcoming AI features)

## ✨ Key Features

*   **➕ Medication Management**: Easily add, edit, and delete medications.
*   **🎨 Color-Coded Medications**: Assign unique colors to medications for quick visual identification.
*   **🗓️ Flexible Scheduling**:
    *   **Daily**: Set medications to be taken at the same time(s) every day.
    *   **Cyclical**: Define dosage patterns that repeat over a specified cycle length (e.g., 21-day cycle with 7 days off).
    *   **Custom Weekly**: Configure different dosages or intake times for specific days of the week.
*   **📊 Dosage Tracking**: Mark medications as taken or not taken for each scheduled intake.
*   **🔄 Rescheduling**: Temporarily "snooze" or reschedule a dose for the current day if you can't take it at the exact scheduled time.
*   **📅 Daily Dashboard**: View a clear list of medications scheduled for the selected day.
*   **⬅️➡️ Date Navigation**: Quickly navigate to previous or next day's schedule using arrow buttons.
*   **📆 Calendar View**: Pick any date from a calendar popup to see the medication schedule for that specific day.
*   **📝 Notes**: Add important notes to each medication (e.g., "take with food").
*   **🔔 Notifications & Reminders**:
    *   **Pre-dose Reminders**: Get a browser notification 10 minutes before a medication is due (requires notification permission).
    *   **Missed Dose Alerts**: Receive an alert if a medication is not marked as taken shortly after its scheduled time.
*   **🌓 Dark/Light Mode**: Toggle between light and dark themes for comfortable viewing.
*   **📱 Responsive Design**: Adapts to different screen sizes, making it usable on desktop, tablets, and mobile phones.
*   **💾 Local Storage Persistence**: Your medication data is saved securely in your browser's local storage, so it persists between sessions.

## 🚀 Future Enhancements

We're always thinking of ways to make MediMate even better! Here are some features we're considering for the future:

*   **🤖 AI-Powered Medication Insights (Genkit)**:
    *   Ask questions about your medications.
    *   Potential drug interaction checker (experimental).
    *   Personalized adherence tips.
*   **📈 Adherence Tracking & Reporting**: Visual charts and statistics to monitor your medication adherence over time.
*   **💧 Refill Reminders**: Get notified when your medications might be running low based on your schedule and start date.
*   **👥 User Accounts & Cloud Sync (Optional)**: Securely back up and sync your data across multiple devices.
*   **📄 Printable Schedules**: Generate a printable PDF of your medication schedule.
*   **⚙️ Advanced Notification Customization**: More granular control over reminder timings and sounds.
*   **🌐 Internationalization (i18n)**: Support for multiple languages.

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn

### Installation

1.  Clone the repo:
    ```sh
    git clone https://your-repository-url.git
    cd medimate-project-directory
    ```
2.  Install NPM packages:
    ```sh
    npm install
    # or
    yarn install
    ```

## 🛠️ Available Scripts

In the project directory, you can run:

*   `npm run dev` or `yarn dev`
    *   Starts the development server on `http://localhost:9002` (or your configured port).
    *   The page will reload if you make edits.
*   `npm run build` or `yarn build`
    *   Builds the app for production to the `.next` folder.
    *   It correctly bundles React in production mode and optimizes the build for the best performance.
*   `npm run start` or `yarn start`
    *   Starts the production server (requires a build to be run first).
*   `npm run lint` or `yarn lint`
    *   Runs ESLint to check for code quality and style issues.
*   `npm run typecheck` or `yarn typecheck`
    *   Runs the TypeScript compiler to check for type errors.
*   `npm run genkit:dev` or `yarn genkit:dev`
    *   Starts the Genkit development server (for future AI features).
    *   You'll need to have Genkit configured if you plan to work on AI functionalities.

## 🧪 Testing the Application

Thorough manual testing is recommended to ensure all features work as expected.

1.  **Start the Development Server**:
    ```sh
    npm run dev
    ```
2.  **Open in Browser**: Navigate to `http://localhost:9002`.

3.  **Test Core Functionality**:
    *   **Add Medications**:
        *   Click "Add Medication".
        *   Try adding medications with "Daily", "Cyclical", and "Custom Weekly" frequencies.
        *   Fill all fields, including dosage, unit (try "custom unit" too), time, notes, and color.
        *   Verify the medication appears on the dashboard for the correct dates.
    *   **View Schedule**:
        *   Use the date navigation arrows (⬅️ ➡️) to check past and future days.
        *   Use the calendar icon (📅) to jump to a specific date.
        *   Confirm that medications appear according to their defined schedules (daily, cyclical logic, weekly).
    *   **Mark as Taken/Not Taken**:
        *   Click "Mark as Taken" for a scheduled dose. It should change status and icon (e.g., to a checkmark ✔️).
        *   Click "Mark as Not Taken". It should revert.
    *   **Reschedule (Snooze)**:
        *   For a medication on the *current day* that is *past due* and *not yet taken*, the "Snooze / Reschedule" button should appear.
        *   Click it and enter a new time (HH:MM format).
        *   Verify the medication's displayed time updates for today, and it gets a "Rescheduled" badge.
        *   Check that on other days, the original schedule remains.
    *   **Edit Medications**:
        *   Click the edit icon (✏️) on a medication card.
        *   Modify details (name, schedule, dosage, etc.).
        *   Save and verify changes are reflected on the dashboard.
    *   **Delete Medications**:
        *   Click the trash icon (🗑️) on a medication card.
        *   Confirm deletion in the alert dialog.
        *   Verify the medication is removed from the schedule and all logs.
    *   **Notifications**:
        *   Your browser will ask for notification permission. Allow it.
        *   To test pre-dose reminders: add a medication scheduled for ~11 minutes from the current time. Wait to see if a reminder appears 10 minutes before.
        *   To test missed dose alerts: add a medication scheduled for a few minutes in the past (or current time), don't mark it as taken, and wait ~1-2 minutes past its scheduled time.
        *   *Note*: Browser notification behavior can sometimes be tricky to test reliably due to system settings, focus, etc.
    *   **Theme Toggle**:
        *   Click the ☀️/🌙 icon in the header to switch between light, dark, and system themes.
    *   **Responsiveness**:
        *   Resize your browser window or use browser developer tools to simulate different device sizes (mobile, tablet, desktop).
        *   Ensure the layout adapts correctly and all elements are usable.
    *   **Data Persistence**:
        *   Add/edit medications, mark some as taken.
        *   Close the browser tab/window and reopen it.
        *   Verify your data is still there (it's stored in local storage).

4.  **Code Quality Checks**:
    *   Run `npm run lint` to catch any linting issues.
    *   Run `npm run typecheck` to ensure there are no TypeScript errors.

## 📦 Building for Production & Deployment

### Building the App

To create an optimized production build of the application:

```sh
npm run build
```

This command bundles the application and outputs the static files and server code into the `.next` directory.

### Running the Production Build Locally

After a successful build, you can start a local production server:

```sh
npm run start
```

This is useful for testing the production build before deploying.

### Deployment 🚀

MediMate is a Next.js application and can be deployed to any platform that supports Node.js or static site hosting (though Next.js benefits from Node.js for its full features).

*   **Vercel**: The easiest way to deploy Next.js applications. Vercel is made by the creators of Next.js and offers seamless integration. Simply connect your Git repository.
*   **Netlify**: Another popular option for deploying modern web applications.
*   **AWS Amplify, Google Cloud Run, Azure App Service**: Cloud provider options for more custom deployments.
*   **Firebase Hosting**: Can host the static parts of a Next.js app, or with Cloud Functions/Run for the dynamic parts.
*   **Node.js Server**: Deploy to any server environment where you can run a Node.js application.

Follow the deployment guides specific to your chosen hosting platform.

### "Creating an APK" (Mobile Experience) 📱

The request to "create an APK file" typically refers to an Android application package. Since MediMate is a **web application**, it doesn't directly produce an APK. However, you can achieve a native-like experience on mobile devices using Progressive Web App (PWA) features.

**Progressive Web App (PWA) Potential:**

*   Next.js applications can be configured to be PWAs. This involves adding a manifest file and a service worker.
*   **Benefits of a PWA**:
    *   **Installable**: Users can add the web app to their home screen, making it feel like a native app.
    *   **Offline Access**: Service workers can cache assets for offline use (basic functionality might work offline).
    *   **App-like Feel**: Can run in a standalone window without browser UI.
*   **Future Work**: Explicit PWA configuration (e.g., using `next-pwa`) could be added to enhance the mobile experience.

If a true native application (APK for Android, IPA for iOS) is required, the web application would need to be wrapped using tools like:
*   **Capacitor** or **Apache Cordova**: To bundle the web app into a native shell.
*   **Tauri**: For desktop applications, but also has mobile support in development.
This is a more involved process and is beyond the current scope of this web-first application.

## 💻 Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Date Management**: [date-fns](https://date-fns.org/)
*   **Schema Validation**: [Zod](https://zod.dev/)
*   **Form Management**: [React Hook Form](https://react-hook-form.com/)
*   **AI (Future)**: [Genkit](https://firebase.google.com/docs/genkit)

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again! ⭐

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE.txt` for more information (if a LICENSE file is added to the project).

---

Happy Hacking! 🎉 Let's make medication management simpler, together.
