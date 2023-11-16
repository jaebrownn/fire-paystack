<!-- 
This file provides your users an overview of how to use your extension after they've installed it. All content is optional, but this is the recommended format. Your users will see the contents of this file in the Firebase console after they install the extension.

Include instructions for using the extension and any important functional details. Also include **detailed descriptions** for any additional post-installation setup required by the user.

Reference values for the extension instance using the ${param:PARAMETER_NAME} or ${function:VARIABLE_NAME} syntax.
Learn more in the docs: https://firebase.google.com/docs/extensions/publishers/user-documentation#reference-in-postinstall

Learn more about writing a POSTINSTALL.md file in the docs:
https://firebase.google.com/docs/extensions/publishers/user-documentation#writing-postinstall
-->

# See it in action

You can test out this extension right away!

Simply create a new document in your payments collection using the Firebase console, navigate to the `authorization_url` populated in the document, pay, and see the status of the document update

# Using the extension

When triggered by a Firestore Document created event in the correspoding payments collection, this extension responds with the `auhtorization_url` to process a payment. Upon successful payment, the status of the document is then updated accoridngly.

To learn more about HTTP functions and other trigger options, visit the [functions documentation](https://firebase.google.com/docs/functions).

<!-- We recommend keeping the following section to explain how to monitor extensions with Firebase -->
# Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
