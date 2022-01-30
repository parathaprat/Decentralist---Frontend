import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';

const App = () => {

  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x9d14544B796d91A8a70e05B07DfA425d9E900125"
  const contractABI = abi.abi

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

   /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(document.getElementById("song").value, {gasLimit: 300000});
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        getAllWaves();
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);

   const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }



  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, [])

//   const getAllWaves = async () => {
//   const { ethereum } = window;

//   try {
//     if (ethereum) {
//       const provider = new ethers.providers.Web3Provider(ethereum);
//       const signer = provider.getSigner();
//       const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
//       const waves = await wavePortalContract.getAllWaves();

//       const wavesCleaned = waves.map(wave => {
//         return {
//           address: wave.waver,
//           timestamp: new Date(wave.timestamp * 1000),
//           message: wave.message,
//         };
//       });

//       setAllWaves(wavesCleaned);
//     } else {
//       console.log("Ethereum object doesn't exist!");
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// /**
//  * Listen in for emitter events!
//  */
// useEffect(() => {
//   let wavePortalContract;

//   const onNewWave = (from, timestamp, message) => {
//     console.log("NewWave", from, timestamp, message);
//     setAllWaves(prevState => [
//       ...prevState,
//       {
//         address: from,
//         timestamp: new Date(timestamp * 1000),
//         message: message,
//       },
//     ]);
//   };

//   if (window.ethereum) {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();

//     wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
//     wavePortalContract.on("NewWave", onNewWave);
//   }

//   return () => {
//     if (wavePortalContract) {
//       wavePortalContract.off("NewWave", onNewWave);
//     }
//   };
// }, []);


  return (

    <body>
    
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">
            💃 Decentralized Playlist!🕺
        </div>

          <div className="bio">

            Add the name of a song along with an artist here, and contribute to the world's first decentralized playlist!
        </div>

          <input type="text" id="song" placeholder = "Song - Artist" className="song"></input>

          <button className="waveButton" onClick={wave}>
            Push to Add
        </button>

         {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="index">
              <div><a className="bold">Song:</a>  {wave.message}</div>
              <div><a className="bold">Address:  </a>{wave.address}</div>
              <div><a className="bold">Time:</a>  {wave.timestamp.toString()}</div>
            </div>)
        })}

        </div>
      </div>
      </body>
    
  );
}

export default App
