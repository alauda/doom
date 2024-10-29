---
description: Create an application through a visual UI form, including adding components and configuring operational features separately.
weight: 10
---

# Create an application - In form

Create an application through a visual UI form, including adding components and configuring operational features separately.

## Prerequisites

Obtain the image address. The image source includes the image repository integrated by the platform administrator through the toolchain, or the image repository of a third-party platform.

- For the former, the platform administrator usually assigns the image repository to your project, and you can use the images in it. If the required image repository is not found, contact the platform administrator for allocation.

- If it is a third-party platform's image repository, make sure that the image can be pulled directly from it in the current cluster.

## Procedure

1. In the left navigation pane, click **Applications** > **OAM Applications**.

2. Click **Create Application**.

3. Select **In Form**.

4. Fill in the application name and set tags or annotations.

   | Parameter       | Description                                                                                                                                                                                                                                                                                                                                                                                |
   | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
   | **Tags**        | Used to select objects and find a collection of objects that meet certain conditions. It needs to be in the form of key-value pairs, for example, _app.kubernetes.io/name: hello-app_.                                                                                                                                                                                                     |
   | **Annotations** | Used to provide any information to the development and operation teams. It needs to be in the form of key-value pairs, for example, _cpaas.io/maintainer: kim_. <br>**Note**: If the annotation value is a clickable link, set the key as **app.{texts}.url**. Clicking the displayed text in the interface can complete the jump, for example, _app.Docs.url: https://example.com/docs/_. |

5. Click **Add Component**.

6. Select a category of components and click **Next**.
7. Continue to configure properties, add operational features, and so on.

   - [Description of pre-set component properties]()
   - [Description of pre-set operational features]()
   - [Import custom components]()
   - [Import custom operational features]()

   **Note**: You can configure operational features immediately or wait until the environment is ready.
