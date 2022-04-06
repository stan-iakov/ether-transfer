import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer  = provider.getSigner();

    const transactionContract = new ethers.Contract(contractAddress,contractABI,signer);


    return transactionContract;
} 

export const TransactionProvider = ({children}) => {

    const[isLoading, setIsLoading] = useState(false);
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({addressTo: '', amount: '', keyword: '',message: ''});

    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));

    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState,[name]: e.target.value}));
    }

    const getAllTransactions = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");

            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber()*1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)

            }))

            setTransactions(structuredTransactions);
            console.log(structuredTransactions);

        }
        catch(error) {
            console.log(error);
        }
    }

    const checkifWalletisConnected = async () => {

        try {
        if(!ethereum) return alert("Please install metamask");

        const accounts = await ethereum.request({method: 'eth_accounts'});

        if(accounts.length) {
            setCurrentAccount(accounts[0]);

            getAllTransactions();

            //getAll of the transactionsq
            console.log(accounts);
        }
        else {
            console.log('No accounts found');
        }
    }
    catch(error) {
        console.log(error);
        throw new Error('No ethereum object')
    }

    }

    const checkIfTransactionExists = async () => {
        try {
            const transactionContract = getEthereumContract();

            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount);


        }
        catch(error) {
            console.log(error);

            throw new Error("No etheru; object")
        }
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install Metamask");
            const accounts = await ethereum.request({method: 'eth_requestAccounts'});

            setCurrentAccount(accounts[0]);

        } catch(error) {
            console.log(error);

            throw new Error("No etheru; object");
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install Metamask");

            //get the data from the form
            const {addressTo,amount,keyword,message} = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', //21000 gwei
                    value: parsedAmount._hex, //0
                }]
            });

            //store the transaction
            const  transactionHash = await transactionContract.addToBlockchain(addressTo,parsedAmount,keyword,message);

            setIsLoading(true);
            console.log('Loading - ${transactionHash.hash}');
            await transactionHash.wait();
            setIsLoading(false);
            console.log('Success - ${transactionHash.hash}');

            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());

            window.reload();


        } catch(error) {
            console.log(error);

            throw new Error('No ethereum object');
        }
    }

    useEffect(() => {
        checkifWalletisConnected();
        checkIfTransactionExists();

    },[]);

    return (
        <TransactionContext.Provider value={{connectWallet: connectWallet,currentAccount: currentAccount, 
        formData: formData, sendTransaction: sendTransaction, handleChange: handleChange, transactions: transactions, isLoading: isLoading}}>
            {children}
        </TransactionContext.Provider>
    )

}