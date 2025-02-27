use crate::build_solidity;
use ethabi::Token;

#[test]
fn test_slice_in_phi() {
    let file = r#"
    contract c1 {
        function test() public returns (string) {
            string ast = "Hello!";
            string bst = "from Solang";

            while (ast == bst) {
                ast = ast + "a";
            }

            return ast;
        }
    }
    "#;

    let mut vm = build_solidity(file);
    vm.constructor("c1", &[]);
    let returns = vm.function("test", &[], &[], None);

    assert_eq!(returns, vec![Token::String(String::from("Hello!"))]);
}
