# Authorization Tests

The tests within this directory test the functionality provided by the authorization service with a provided Cedar policy and schema. The tests will only pass if the outcomes asserted in the tests match the permissions specified within the Cedar policy and authorization schema defined in the schema file.

A number of typescript types, enums, configuration and functions have been provided within this directory along side the tests to help implement the use of the cedar policy and schema which have been based on a fictitious `Order` entity and actions around what roles can interact with the Order data. These file have been included for testing purposes only and are not intended to be provided and used by services using the Auth SDK. These roles and actions are defined below:

- Customer -> A customer can create an order and view their own orders. They cannot create, get or list orders for other customers. They also cannot modify an order with a status other than PENDING.
- Sales Staff -> Sales staff can create an order for any customer, view all orders and modify all orders. They also cannot modify an order with a status other than PENDING.
- Sale Manager -> Sale managers can create an order for any customer, view all orders and modify all orders. They also cannot modify an order with a status other than PENDING.
- Account Manager -> An account manager can view orders for a customer account they manage. They cannot create, update or delete any orders.
- Accountant -> An accountant can view all orders but cannot modify an order. They cannot create, update or delete any orders.

There are a number of resources available to understand and learn the [Cedar policy language](https://www.cedarpolicy.com/) as follows:

- [Cedar policy tutorial](https://www.cedarpolicy.com/en/tutorial)
- [Cedar policy language guide](https://docs.cedarpolicy.com/)
- [Cedar policy blog](https://www.cedarpolicy.com/blog)
- [Cedar SDK](https://github.com/cedar-policy)
- [Cedar policy playground](https://www.cedarpolicy.com/en/playground)
