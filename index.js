import { ethers } from "./ethers-5.6.min.js";
import { abi, contractAddress } from "./constants.js";

const fundBtn = document.getElementById("fund-btn");
const connectBtn = document.getElementById("connect-btn");
const balanceBtn = document.getElementById("balance-btn");
const withdrawBtn = document.getElementById("withdraw-btn");
fundBtn.onclick = fund;
connectBtn.onclick = connect;
balanceBtn.onclick = getBalance;
withdrawBtn.onclick = withdraw;
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum
            .request({ method: "eth_requestAccounts" })
            .catch((err) => {
                console.error("错误", err);
            })
            .then(() => {
                document.getElementById("connect-btn").innerHTML = "Connected";
                console.log("connected!");
            });
    } else {
        document.getElementById("connect-btn").innerHTML =
            "Please install metamask";
        console.error("not metamask");
    }
}
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        const formatEther = ethers.utils.formatEther(balance);
        console.log(formatEther);
        console.log(formatEther);
    }
}
async function withdraw() {
    console.log("withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
        const transactionResponse = await contract.withdraw();
        await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {}
}
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log("funding with", ethAmount);
    // 需要签名 钱包 和 金额
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        // console.log(signer);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
            console.log("done!");
        } catch (error) {
            console.log("错误", error);
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`);
    return new Promise((reject, resolve) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            );
            reject();
        });
    });
}
