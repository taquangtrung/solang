Interfaces and libraries
========================

Interfaces
__________

An interface is a contract sugar type with restrictions. This type cannot be instantiated; it can only define the
functions prototypes for a contract. This is useful as a generic interface.

.. code-block:: solidity

    interface operator {
        function op1(int32 a, int32 b) external returns (int32);
        function op2(int32 a, int32 b) external returns (int32);
    }

    contract ferqu {
        operator op;

        constructor(bool do_adds) {
            if (do_adds) {
                op = new m1();
            } else {
                op = new m2();
            }
        }

        function x(int32 b) public returns (int32) {
            return op.op1(102, b);
        }
    }

    contract m1 is operator {
        function op1(int32 a, int32 b) public override returns (int32) {
            return a + b;
        }

        function op2(int32 a, int32 b) public override returns (int32) {
            return a - b;
        }
    }

    contract m2 is operator {
        function op1(int32 a, int32 b) public override returns (int32) {
            return a * b;
        }

        function op2(int32 a, int32 b) public override returns (int32) {
            return a / b;
        }
    }

- Interfaces can only have other interfaces as a base contract
- All functions must the ``external`` visibilty
- No constructor can be declared
- No contract storage variables can exist (however constants are allowed)
- No function can have a body or implementation

Libraries
_________

Libraries are a special type of contract which can be reused in multiple contracts. Functions declared in a library can
be called with the ``library.function()`` syntax. When the library has been imported or declared, any contract
can use its functions simply by using its name.

.. code-block:: javascript

    contract test {
        function foo(uint64 x) public pure returns (uint64) {
            return ints.max(x, 65536);
        }
    }

    library ints {
        function max(uint64 a, uint64 b) public pure returns (uint64) {
            return a > b ? a : b;
        }
    }

When writing libraries there are restrictions compared to contracts:

- A library cannot have constructors, fallback or receive function
- A library cannot have base contracts
- A library cannot be a base contract
- A library cannot have virtual or override functions
- A library cannot have payable functions

.. note::

    When using the Ethereum Foundation Solidity compiler, library are a special contract type and libraries are
    called using `delegatecall`. Parity Substrate has no ``delegatecall`` functionality so Solang statically
    links the library calls into your contract code. This does make for larger contract code, however this
    reduces the call overhead and make it possible to do compiler optimizations across library and contract code.

Library Using For
_________________

Libraries can be used as method calls on variables. The type of the variable needs to be bound to the
library, and the type of the first parameter of the function of the library must match the type of a
variable.

.. code-block:: solidity

    contract test {
        using lib for int32[100];

        int32[100] bar;

        function foo() public returns (int64) {
            bar.set(10, 571);
        }
    }

    library lib {
        function set(int32[100] storage a, uint index, int32 val) internal {
            a[index] = val;
        }
    }

The syntax ``using`` `library` ``for`` `Type` ``;`` is the syntax that binds the library to the type. This
must be specified on the contract. This binds library ``lib`` to any variable with type ``int32[100]``.
As a result of this, any method call on a variable of type ``int32[100]`` will be matched to library ``lib``.

For the call to match, the first argument of the function must match the variable; note that here, `bar`
is of type ``storage``, since all contract variables are implicitly ``storage``.

There is an alternative syntax ``using`` `library` ``for *;`` which binds the library functions to any
variable that will match according to these rules.