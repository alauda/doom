---
description: OAM applications implement higher-level integration and abstraction of containers and Kubernetes resources, allowing you to focus more on application development and operation.
weight: 1
---

# Overview

OAM applications implement higher-level integration and abstraction of containers and Kubernetes resources, allowing you to focus more on application development and operation.

## Architecture

![](/en/OAM.png)

## Terminology explanation

| Term              | Explanation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OAM**           | Open Application Model is a model for defining cloud-Applications. Compared to container or Kubernetes orchestration logic, OAM focuses more on the "application" itself. Based on OAM, the general capabilities of the application are encapsulated into high-level interfaces for use, and are integrated throughout the deployment, development, and operation of the application.                                                                                                                                                                     |
| **Component**     | Components are an important part of OAM applications and can be the application service itself, such as a stateless web service, or a service that the application depends on, such as Redis. Components encapsulate the basic capabilities required by the application, such as computing and networking, and are reusable modules. Through components, application developers can quickly create applications and invest in application development.                                                                                                    |
| **Traits**        | Traits refer to a series of features related to application operation that have different implementation methods in different environments: scaling policies, inbound rules, and environment variables, etc. As long as the conditions required by the traits are met, even in different deployment environments (such as X86 architecture clusters and ARM architecture clusters), the application can run uniformly according to the same rules, and application operators do not need to adjust the configuration based on the deployment environment. |
| **App Resources** | Resources required for the normal operation of the application and its components, including storage and configuration.                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## Features

### Efficient operation and maintenance

Through OAM applications, application operation and maintenance personnel can focus on business logic and manage applications from the application perspective rather than the platform perspective, reducing the threshold for application operation and maintenance. Platform operation and maintenance personnel can handle platform plugins, operation and maintenance plugins, and other configurations uniformly, thereby improving operational efficiency.

### Portability

The OAM application model includes configurations related to application operation and maintenance, service governance, etc. Compared with applications deployed through Operators, Charts, and other methods, OAM applications can be repeatedly deployed through YAML, making cross-environment migration easier. Even without Kubernetes and specific vendors, OAM applications can run normally on various platforms.

### Scalability

Several types of components pre-installed on the platform can meet most application development needs: network services, stateful applications, and native Kubernetes resources. In addition, the platform also provides the ability to extend components and traits, making it easy for developers to use custom-designed and encapsulated components and traits.
