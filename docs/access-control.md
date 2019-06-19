## Access Control

This document describes the key features and concepts of the current state of 
access control in Mailtrain. 
 
The current state provides user management and granular access control to reports
and report templates. The user management supports both local authentication and
LDAP-based authentication.

The access control has two abstractions levels: a high-level intended to be used through web UI,
and low-level, intended to be configured once through the Mailtrain config file. The high-level
layer serves for providing access to variuous resources, while the low-level layer is meant
to define the access roles in Mailtrain to reflect an organisational or process hierarchy.

### High-level access management (through web UI)

On the high abstraction level, which is accessible to users via the web-based UI, Mailtrain
recognizes different entities (reports, report templates, etc.) and user roles that regulate
access to these entities (e.g. role "reporter" that allows viewing a report but prevents editing
or deleting it). Access to entities is provided through so called "shares". A share is essentially
a triple: entity - role - user. 

Mailtrain further features hierarchical namespaces. Every entity has to reside in a namespace 
(in reality, the namespace itself is an entity to which access can be given).

While sharing an entity with a user gives the user access to the particular entity (in the
scope of the role), sharing a namespace amounts to giving access to all entities within 
the namespace and transitively in all child namespaces. The role that regulates the access to the
particular namespaces further determines the access to all different entity types that can 
reside in the namespace.

To simplify the management of permissions, every user is associated with one global role and
a namespace. The global role regulates access to global resources and operations (i.e. those
things that are not associated with any namespace). An example of such a global operation is 
rebuilding the permission cache. Further, the global role determines a default share of the
root namespace and the namespace of the user. For example, an administrator's global role may 
specify that a user get administrator's role in the root namespace, which effectively gives
him/her access to everything.

Mailtrain resets these default shares at start and also whenever permission cache is rebuilt
(essentially every time user, namespace or some entity is created or when share or user's
 role is assigned). This effectively prevents deleting or overriding the default shares that
 the user has through the global role.


### Low-level access management (through config file)

Internally, Mailtrain relies on fine-grained permissions, which are triplets: 
user - operation - entity (e.g. user id 1 - view - report id 2). These permissions are stored
in a permission cache (in DB) and automatically generated at startup and whenever the permissions
 could have changed.
 
Mailtrain's config file defines the roles (available in the high-level access management) and 
specifies the mapping of roles to operations.

The roles are potentially different for each entity type/scope (currently global, namespace, report, 
report template). Each role defines the permitted operations for the given entity type/scope.
A namespace role further defines allowed operations for entity types within and under the 
 namespace.

The following defines the role master for scope "global". This effectively means that in 
"Create/Edit User" form, the user can be given role "Master". 
The role gives the permission to rebuild the permission cache. 

Further, it specifies that the
holder of the role will automatically be given access (share) to the root namespace in the
namespace role "master" (specified by ```rootNamespaceRole="master"```). This access to the root namespace is given irrespective of the namespace
in which the user is created. This highlight the dual purpose of namespaces: a) they group
entities w.r.t. access management, b) they allow categorizing entities and users in a hierarchy
to potentially reflect the organisational or process hierarchy. The latter is especially useful for
more enterprise applications where a single installation of Mailtrain serves a number of rather
independent groups.

The global role defined below is also an admin role (denoted by the ```admin=true```), which means that user id 1 will always be reset to this role.
This serves as a kind of bootstrap that makes sure that there is always a user that can be
used to give access to other users.
```
[roles.global.master]
name="Master"
admin=true
description="All permissions"
permissions=["rebuildPermissions"]
rootNamespaceRole="master"
```

Another example for a global role is the following. This one is intended for regular users.
As such, it does not automatically give access to everything. Rather, it gives limited access
to entities under the namespace in which the user has been created. This is specified by the
```ownNamespaceRole="editor"```
```
[roles.global.editor]
name="Editor"
description="Anything under own namespace except operations related to sending and doing reports"
permissions=[]
ownNamespaceRole="editor"
```

The roles for entities are defined in a similar fashion. The example below shows the definition
of the role "master" for "report" entities. It lists the operations that a user
that has "master" access to a particular report can do with the report. Note that to get the
"master" access to a particular report through this role, the report would either have to be shared with the user
with role "master".  
```
[roles.report.master]
name="Master"
description="All permissions"
permissions=["view", "edit", "delete", "share", "execute", "viewContent", "viewOutput"]
```

The same for the restricted role "editor" can look as follows.
```
[roles.report.editor]
name="Editor"
description="Anything under own namespace except operations related to sending and doing reports"
permissions=["view", "viewContent", "viewOutput"]
```

The following defines the role "master" for "namespace" entities. Similarly to the example above,
it lists operations that relate to a namespace. In particular all "create" operations pertain
to a namespace rathen than to an entity, which at the time of creation does not exist yet.
Additionally, the namespace roles define permissions to all entity types under the namespace
(including child namespaces). 
```
[roles.namespace.master]
name="Master"
description="All permissions"
permissions=["view", "edit", "delete", "share", "createNamespace", "createReportTemplate", "createReport", "manageUsers"]

[roles.namespace.master.children]
reportTemplate=["view", "edit", "delete", "share", "execute"]
report=["view", "edit", "delete", "share", "execute", "viewContent", "viewOutput"]
namespace=["view", "edit", "delete", "share", "createNamespace", "createReportTemplate", "createReport", "manageUsers"]
```

And the same for the more restricted role "editor".
```
[roles.namespace.editor.children]
reportTemplate=[]
report=["view", "viewContent", "viewOutput"]
namespace=["view", "edit", "delete"]
```