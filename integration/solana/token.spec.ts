import { getOrCreateAssociatedTokenAccount, createMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair } from '@solana/web3.js';
import { publicKeyToHex } from '@solana/solidity';
import { loadContract } from './setup';
import expect from 'expect';

describe('Create spl-token and use from solidity', function () {
    this.timeout(500000);

    it('spl-token', async function name() {
        const { contract, connection, payer, program } = await loadContract('Token', 'Token.abi');

        const mintAuthority = Keypair.generate();
        const freezeAuthority = Keypair.generate();

        const mint = await createMint(
            connection,
            payer,
            mintAuthority.publicKey,
            freezeAuthority.publicKey,
            3
        );

        await contract.functions.set_mint(publicKeyToHex(mint));

        expect(Number((await contract.functions.total_supply({ accounts: [mint] })).result)).toBe(0);

        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            payer.publicKey
        )

        expect(Number((await contract.functions.get_balance(publicKeyToHex(tokenAccount.address), { accounts: [tokenAccount.address] })).result)).toBe(0);

        // Now let's mint some tokens
        await contract.functions.mint_to(
            publicKeyToHex(tokenAccount.address),
            publicKeyToHex(mintAuthority.publicKey),
            100000,
            {
                accounts: [TOKEN_PROGRAM_ID],
                writableAccounts: [mint, tokenAccount.address],
                signers: [mintAuthority]
            },
        );

        // let's check the balances
        expect(Number((await contract.functions.total_supply({ accounts: [mint] })).result)).toBe(100000);

        expect(Number((await contract.functions.get_balance(publicKeyToHex(tokenAccount.address), { accounts: [tokenAccount.address] })).result)).toBe(100000);

        // transfer
        const theOutsider = Keypair.generate();

        const otherTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            theOutsider.publicKey
        )

        await contract.functions.transfer(
            publicKeyToHex(tokenAccount.address),
            publicKeyToHex(otherTokenAccount.address),
            publicKeyToHex(payer.publicKey),
            70000,
            {
                accounts: [TOKEN_PROGRAM_ID],
                writableAccounts: [otherTokenAccount.address, tokenAccount.address],
                signers: [payer]
            },
        );


        expect(Number((await contract.functions.total_supply({ accounts: [mint] })).result)).toBe(100000);

        expect(Number((await contract.functions.get_balance(publicKeyToHex(tokenAccount.address), { accounts: [tokenAccount.address] })).result)).toBe(30000);

        expect(Number((await contract.functions.get_balance(publicKeyToHex(otherTokenAccount.address), { accounts: [otherTokenAccount.address] })).result)).toBe(70000);

        // burn
        await contract.functions.burn(
            publicKeyToHex(otherTokenAccount.address),
            publicKeyToHex(theOutsider.publicKey),
            20000,
            {
                accounts: [TOKEN_PROGRAM_ID],
                writableAccounts: [otherTokenAccount.address, mint],
                signers: [theOutsider]
            },
        );

        expect(Number((await contract.functions.total_supply({ accounts: [mint] })).result)).toBe(80000);

        expect(Number((await contract.functions.get_balance(publicKeyToHex(tokenAccount.address), { accounts: [tokenAccount.address] })).result)).toBe(30000);

        expect(Number((await contract.functions.get_balance(publicKeyToHex(otherTokenAccount.address), { accounts: [otherTokenAccount.address] })).result)).toBe(50000);
    });
});