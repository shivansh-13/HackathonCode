'use client'
// EtherContext.tsx

import { createContext, useState, ReactNode } from 'react';
import { ethers } from 'ethers';

type EtherContextType = {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  loadWeb3Modal: () => Promise<void>;
  getWBTCBalance: (account: string) => Promise<string>;
  logout: () => void; // Add this line
};

const WBTC_CONTRACT_ADDRESS = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"; // replace with actual wBTC contract address

const ERC20_ABI = [
  // some methods from the ERC20 standard
  "function balanceOf(address account) view returns (uint)"
];

export const EtherContext = createContext<EtherContextType>({
  account: null,
  provider: null,
  loadWeb3Modal: async () => { },
  getWBTCBalance: async () => "0",
  logout: () => { }
});

type Props = {
  children: ReactNode;
};

export function EtherProvider({ children }: Props) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // const storedAccount = localStorage.getItem('account');
  // const [account, setAccount] = useState<string | null>(storedAccount);



  /////

  let storedAccount = null;
  if (typeof window !== 'undefined') {
    storedAccount = window.localStorage.getItem('account');
  }
  const [account, setAccount] = useState<string | null>(storedAccount);

  /////

  const loadWeb3Modal = async () => {
    //@ts-ignore
    if (typeof window.ethereum !== 'undefined') {
      //@ts-ignore
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      try {
        //@ts-ignore
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);
        localStorage.setItem('account', account);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const logout = () => {
    setAccount(null);
    setProvider(null);
    localStorage.removeItem('account');
    window.location.reload();
  }


  const getWBTCBalance = async (account: string) => {
    if (!provider) {
      return "0";
    }
    const tokenContract = new ethers.Contract(WBTC_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const balance = await tokenContract.balanceOf(account);
    return ethers.formatUnits(balance, 8); // WBTC has 8 decimal places
  }

  return (
    <EtherContext.Provider value={{ account, provider, loadWeb3Modal, getWBTCBalance, logout }}>
      {children}
    </EtherContext.Provider>
  );
}
