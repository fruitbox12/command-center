import { networkData } from "../lib/network";
import { Language } from "./language";

export const ENGLISH: Language = {
    wallet: {
        metamask: `MetaMask`,
        metamaskDescription: `Sign in using the MetaMask extension or a Web3 browser`,

        noAccounts: `No accounts found. Ensure your wallet is unlocked.`,
        mustInstallMetaMask: `You must install MetaMask to access your darknodes.`,
        mustChangeNetwork: `You must change your wallet to the ${networkData.ethNetworkLabel} network.`,
        mustUnlock: `You must unlock MetaMask to access your darknodes.`,
        mustConnect: `You must connect MetaMask to access your darknodes.`,
    }
};
