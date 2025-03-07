// Customer Policies

// Customer can view their own orders
permit (
    principal,
    action in [OrderService::Action::"getOrder", OrderService::Action::"listOrders"],
    resource
)
when {
    resource.customer == principal &&
    principal in OrderService::Role::"customers"
};

// Customers can create their own orders
permit (
    principal,
    action in [OrderService::Action::"createOrder"],
    resource
)
when {
    resource.createdBy == principal &&
    resource.customer == principal &&
    principal in OrderService::Role::"customers"
};

// Customers can update and delete any order if the status is a certain value
permit (
    principal,
    action in [OrderService::Action::"updateOrder", OrderService::Action::"deleteOrder"],
    resource
)
when {
    resource.status == "PENDING" &&
    resource.createdBy == principal &&
    resource.customer == principal &&
    principal in OrderService::Role::"customers"
};

// Sales Staff and Sale Managers Policies

// Sales Staff and Sale Managers can view and create any orders
permit (
    principal,
    action in [OrderService::Action::"createOrder", OrderService::Action::"getOrder", OrderService::Action::"listOrders"],
    resource
)
when {
    principal in OrderService::Role::"saleStaff" || principal in OrderService::Role::"saleManagers"
};

// Sales Staff and Sale Managers can update and delete any order if the status is a certain value
permit (
    principal,
    action in [OrderService::Action::"updateOrder", OrderService::Action::"deleteOrder"],
    resource
)
when {
    resource.status == "PENDING" &&
    (principal in OrderService::Role::"saleStaff" || principal in OrderService::Role::"saleManagers")
};

// Account Manager Policies

// Account Managers can view orders for accounts they manage
permit (
    principal,
    action in [OrderService::Action::"getOrder", OrderService::Action::"listOrders"],
    resource
)
when {
    resource.accountManager == principal &&
    principal in OrderService::Role::"accountManagers"
};

// Accountant Policies

// Accountants can view orders for any account
permit (
    principal,
    action in [OrderService::Action::"getOrder", OrderService::Action::"listOrders"],
    resource
)
when {
    principal in OrderService::Role::"accountants"
};

