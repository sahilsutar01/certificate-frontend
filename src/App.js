import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import AccreditationRegistryABI from "./AccreditationRegistryABI.json";

const backendURL = "http://localhost:5001";
const CONTRACT_ADDRESS = "0x235c70b08696b89Aac2Dd8e4e4e43003b44Ed7E6";

const generateContentHash = (collegeAddress, rollNo) => ethers.solidityPackedKeccak256(["address", "string"], [collegeAddress, rollNo.toLowerCase()]);

export default function App() {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [status, setStatus] = useState("Connect wallet to begin.");
    const [collegeName, setCollegeName] = useState("");
    const [requestStatus, setRequestStatus] = useState('idle');
    const [accreditationProof, setAccreditationProof] = useState(null);
    const [accreditationSignature, setAccreditationSignature] = useState(null);
    const [studentName, setStudentName] = useState("");
    const [course, setCourse] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [dateOfIssuing, setDateOfIssuing] = useState(new Date().toISOString().slice(0, 10));
    const [canIssue, setCanIssue] = useState(false);
    const [verifyId, setVerifyId] = useState("");
    const [verifyResult, setVerifyResult] = useState(null);

    useEffect(() => { setCanIssue(false); }, [studentName, course, rollNo]);

    async function connectWallet() {
        if (!window.ethereum) return setStatus("Install MetaMask.");
        try {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(web3Provider);
            const accounts = await web3Provider.send("eth_requestAccounts", []);
            setAccount(accounts[0]);
            await handleCheckStatus(accounts[0]);
        } catch (err) {
            setStatus("Failed to connect wallet.");
            console.error(err);
        }
    }

    async function handleRequestAccreditation() {
        if (!account || !collegeName) return setStatus("Please connect wallet and enter college name.");
        setStatus("Submitting request for review...");
        try {
            const res = await fetch(`${backendURL}/api/request-accreditation`, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collegeAddress: account, collegeName }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Server responded with status: ${res.status}`);
            setStatus(data.message);
            setRequestStatus('pending');
        } catch (err) {
            setStatus(`Error: ${err.message}`);
            console.error(err);
        }
    }

    async function handleCheckStatus(address) {
        const checkAddress = address || account;
        if (!checkAddress) return;
        setStatus("Checking your accreditation status...");
        try {
            const res = await fetch(`${backendURL}/api/check-status/${checkAddress}`);
            if (res.status === 404) {
                setRequestStatus('idle');
                setStatus("You have not submitted a request yet. Please do so in Step 1.");
                return;
            }
            if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);
            const data = await res.json();
            if (data.status === 'approved') {
                setRequestStatus('approved');
                setAccreditationProof(data.proof);
                setAccreditationSignature(data.signature);
                setStatus("✅ Your accreditation is approved! You can now issue certificates.");
            } else if (data.status === 'pending') {
                setRequestStatus('pending');
                setStatus("Your request is still pending review by the administrator.");
            } else if (data.status === 'rejected') {
                setRequestStatus('rejected');
                setStatus("❌ Your accreditation request was rejected. Please contact the administrator.");
            }
        } catch (err) {
            setStatus(`Error: ${err.message}`);
            console.error(err);
        }
    }

    async function handleCheckDuplicate() {
        if (!rollNo) return setStatus("Please enter a Roll Number to check.");
        setStatus("Checking for duplicate certificate...");
        try {
            const res = await fetch(`${backendURL}/api/check-duplicate`, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collegeAddress: account, rollNo }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Server responded with status: ${res.status}`);
            if (data.isDuplicate) {
                setCanIssue(false);
                setStatus(`❌ Duplicate Found: ${data.message}`);
            } else {
                setCanIssue(true);
                setStatus("✅ This roll number is unique for your college. You can now issue the certificate.");
            }
        } catch (err) {
            setStatus(`Error: ${err.message}`);
            console.error(err);
        }
    }

    async function handleIssueCertificate() {
        if (!canIssue) return setStatus("Please run a successful duplicate check first.");
        if (!studentName || !course || !rollNo || !dateOfIssuing) return setStatus("All certificate fields are required.");
        setStatus("Preparing on-chain transaction...");
        try {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccreditationRegistryABI.abi, signer);
            const certificateId = 'cert-' + Math.random().toString(36).substring(2, 15);
            const contentHash = generateContentHash(account, rollNo);
            const tx = await contract.createCertificateWithProof(certificateId, studentName, course, rollNo, dateOfIssuing, contentHash, accreditationProof.collegeName, accreditationProof.validUntil, accreditationSignature);
            setStatus(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);
            const receipt = await tx.wait();
            setStatus(`✅ Certificate issued! Syncing with server...`);
            await fetch(`${backendURL}/api/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ certificateId, txHash: receipt.hash }) });
            setStatus(`✅ Certificate issued and cached! ID: ${certificateId}`);
            setCanIssue(false);
        } catch (err) {
            setStatus(`Error: ${err.reason || err.message}`);
            console.error(err);
        }
    }

    async function handleVerify() {
        if (!verifyId) return setVerifyResult({ message: "Please enter a Certificate ID." });
        setVerifyResult({ message: "Verifying..." });
        try {
            const res = await fetch(`${backendURL}/api/verify/${verifyId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `Server responded with status: ${res.status}`);
            setVerifyResult({ message: `✅ Verified! (Source: ${data.source})`, certificate: data.certificate });
        } catch (err) {
            setVerifyResult({ message: `❌ Error: ${err.message}` });
            console.error(err);
        }
    }
    
    const renderAccreditationUI = () => {
        switch (requestStatus) {
            case 'pending': return (<div><h3>Request Pending</h3><p>Your request has been submitted and is awaiting administrator approval.</p><button onClick={() => handleCheckStatus()}>Check Status Again</button></div>);
            case 'approved': return (<div><h3>✅ Accreditation Approved!</h3><p>You can now proceed to Step 2 to issue certificates.</p></div>);
            case 'rejected': return (<div><h3>❌ Request Rejected</h3><p>Please contact the administrator for more information.</p></div>);
            default: return (<div><input placeholder="Your College Name" value={collegeName} onChange={e => setCollegeName(e.target.value)} /><button onClick={handleRequestAccreditation} disabled={!account || !collegeName}>Request Accreditation</button></div>);
        }
    }

    return (
        <div style={{ maxWidth: 800, margin: "auto", padding: 20, fontFamily: "sans-serif", display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h1>Decentralized Certificate Registry (Secure Admin)</h1>
            <button onClick={connectWallet}>{account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}</button>
            <div style={{ padding: 10, background: '#f0f0f0', borderRadius: '5px', wordBreak: 'break-word' }}><strong>Status:</strong> {status}</div>
            <section style={{border: '1px solid #ccc', padding: '1rem', borderRadius: '5px'}}><h2>Step 1: Become an Accredited Issuer</h2>{renderAccreditationUI()}</section>
            <section style={{border: '1px solid #ccc', padding: '1rem', borderRadius: '5px', opacity: requestStatus === 'approved' ? 1 : 0.4, pointerEvents: requestStatus === 'approved' ? 'auto' : 'none' }}>
                <h2>Step 2: Issue a Certificate</h2>
                <div style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
                    <input placeholder="Student Name (e.g., Jane Doe)" value={studentName} onChange={e => setStudentName(e.target.value)} />
                    <input placeholder="Course Name (e.g., Intro to AI)" value={course} onChange={e => setCourse(e.target.value)} />
                    <input placeholder="Roll Number (e.g., A-007)" value={rollNo} onChange={e => setRollNo(e.target.value)} />
                    <input type="date" value={dateOfIssuing} onChange={e => setDateOfIssuing(e.target.value)} />
                    <button onClick={handleCheckDuplicate} disabled={!rollNo}>1. Check for Duplicate Roll No.</button>
                    <button onClick={handleIssueCertificate} disabled={!canIssue}>2. Issue On-Chain (Pay gas)</button>
                </div>
            </section>
            <section style={{border: '1px solid #ccc', padding: '1rem', borderRadius: '5px'}}>
                <h2>Step 3: Verify a Certificate</h2>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <input placeholder="Enter Certificate ID" value={verifyId} onChange={e => setVerifyId(e.target.value)} style={{flexGrow: 1}}/>
                    <button onClick={handleVerify}>Verify</button>
                </div>
                {verifyResult && <pre style={{background: '#eee', padding: '1rem', marginTop: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                    <p>{verifyResult.message}</p>
                    {verifyResult.certificate && <p>{JSON.stringify(verifyResult.certificate, null, 2)}</p>}
                </pre>}
            </section>
        </div>
    );
}