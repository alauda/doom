---
description: Login to the Container Platform to operate and manage various resources in the platform.
weight: 5
---

# Platform usage instructions

## Interface overview

![](/en/intro.png)

| Number | Description                                                                                 |
| ------ | ------------------------------------------------------------------------------------------- |
| **1**  | Product logo                                                                                |
| **2**  | Product name                                                                                |
| **3**  | Product switch entrance                                                                     |
| **4**  | Projects and namespaces, used to enter various workspaces.                                  |
| **5**  | Push notifications                                                                          |
| **6**  | Help entrance, including help documents, platform information, platform health status, etc. |
| **7**  | Username                                                                                    |
| **8**  | Left navigation bar                                                                         |
| **9**  | Function operation and display area                                                         |

## Projects and namespaces

In order to provide users with independent workspaces for permissions and resource isolation, as well as unique operational perspectives, Container Platform distinguishes between projects and namespaces for daily work and habits of the target users.

After logging in to Container Platform, users need to select a project and enter a designated namespace before they can start their work. This includes browsing the overview page to understand basic information and resource operation status of the namespace, such as resource quotas, alarm lists, application status, and other information. At the same time, the overview page also provides quick access to resource lists or details pages, making it easy for users to quickly view resources.

![](/en/login.png)

If the user has logged in before, they will be automatically directed to the project they were last working on. Users can quickly switch between projects and namespaces through the top navigation bar.

## Resource Quotas

The resource quotas section displays the usage of resources such as CPU, memory, storage, pods, PVCs (Persistent Volume Claims), GPUs, etc., in the form of **Data Bars** and **Allocated Value / Total Quota**.

### Data Bars

Data bars represent the allocation rate (the ratio of allocated value to total quota) graphically:

- When the allocation rate is less than 70%, the data bar is displayed in green, indicating that the resource quota in the current namespace is sufficient.

- When the allocation rate is between 70% and 90%, the data bar is displayed in yellow, indicating that the resource quota in the current namespace is nearing exhaustion.

- When the allocation rate is greater than 90%, the data bar is displayed in red, indicating that the resource quota in the current namespace is tight, and continuing to create containers may lead to the inability to create or run containers.

### Allocated Value and Quota

- Allocated Value is the total sum of the Limit values for all container groups in the current namespace.

- The calculation of Total Quota is as follows:

  **Note**: When a namespace has not set resource quotas or when neither the namespace nor the project has set resource quotas, the Total Quota will be displayed as **Unlimited**.

  | Is Namespace Resource Quota Set?                                                                             | Is Project Resource Quota Set?                                                                                                                                                              | Is Cluster Oversubscribed?                                                                                               | Total Quota Calculation                                                                               |
  | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
  | Set                                                                                                          | -                                                                                                                                                                                           | -                                                                                                                        | The total quota is set to the resource quota specified when the namespace was created.                |
  | Not Set                                                                                                      | Set                                                                                                                                                                                         | -                                                                                                                        | The total quota is the sum of the allocated value and the current project's available resource quota. |
  | Not Set                                                                                                      | Not Set                                                                                                                                                                                     | Not Oversubscribed (Cluster does not have oversubscription ratio enabled and the cluster's limit rate is less than 100%) | The total quota is the sum of the allocated value and the current cluster's available resource quota. |
  | Oversubscribed (Cluster has oversubscription ratio enabled or the cluster's limit rate is greater than 100%) | The total quota is the sum of the allocated value and the current cluster's available resource quota. When the total quota is less than 0, it will be displayed as -, for example: - Cores. |

## General operations

The following are some common operations that apply to most functional scenarios on the platform, making it easier for you to use the platform's features smoothly.

<style>table th:first-of-type { width: 20%;}</style>

<style>table th:nth-of-type(2) { width: 40%;}</style>

| General Operation       | Steps                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Supplementary Information                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Open feature portal** | Click the corresponding feature menu item in the left navigation bar.                                                                                                                                                                                                                                                                                                                                                                                                                                                             | -                                                                                                                                                                                                                                                                                                                                                                   |
| **View Resources**      | <ol><li>Click the corresponding menu item in the left navigation bar to enter the resource list page.</li><li>Click the resource name to view the resource details.</li></ol>                                                                                                                                                                                                                                                                                                                                                     | <ul><li>The resource list displays the resources created under the corresponding functional module of the platform. Users can view key information of resources on the resource list page and perform quick operations.</li><li>The resource details page allows users to perform resource management operations, and some details pages can switch tabs.</li></ul> |
| **Create resource**     | <ol><li>Click the corresponding menu item on the left navigation bar to enter the resource list page.</li><li>Click **_Create XX_**.</li></ol>                                                                                                                                                                                                                                                                                                                                                                                    | When creating a resource, you usually need to enter the relevant parameter values for the resource. Please refer to the functional module documentation for details.                                                                                                                                                                                                |
| **Update Resource**     | <ol><li>Click the corresponding menu item on the left navigation bar to enter the resource list page.</li><li>Click the **Update** button on the right side of the resource record to be updated. It is represented by ![](/en/point.png).</li></ol>**or**：<br><ol><li>Click the corresponding menu item on the left navigation bar to enter the resource list page.</li><li>Click the resource name to enter the resource details page.</li><li>Click **Actions** > **Update** in the upper right corner of the page.</li></ol> | When updating a resource, usually only partial parameter information of the resource can be updated, and it is not allowed to update parameters that identify key properties of the resource, such as the resource name. Please refer to the create operation for updating.                                                                                         |
| **Deleting Resources**  | <ol><li>Click the corresponding menu item on the left navigation bar to enter the resource list page.</li><li>Click the **Delete** button on the right side of the resource record to be deleted. It is represented by ![](/en/point.png).</li></ol>**or**：<ol><li>Click the corresponding menu item on the left navigation bar to enter the resource list page.</li><li>Click the resource name to enter the resource details page.</li><li>Click **Actions** > **Delete** in the upper right corner of the page.</li></ol>     | The delete resource operation is irreversible, so please be cautious when executing it. Usually, a prompt will pop up on the interface to require you to confirm the operation twice. Please follow the prompt to execute the corresponding operation.                                                                                                              |
