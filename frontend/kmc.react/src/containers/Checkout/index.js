import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import ReactToPrint from "react-to-print"
import PrintableProductTable from "../../components/PrintableProductTable";
import { onError } from "../../libs/errorLib";
import "./index.css";

function PaymentConfirmation({id}) {
    const [isLoading, setIsLoading] = useState(true);

    const handleMessage = (event) => {
        if (event.data.action === 'receipt-loaded') {
            setIsLoading(false);
        }
    };

    const printIframe = (id) => {
        const iframe = document.frames
        ? document.frames[id]
        : document.getElementById(id);
        const iframeWindow = iframe.contentWindow || iframe;

        iframe.focus();
        iframeWindow.print();

        return false;
    };

    useEffect(() => {
        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <>
            <iframe
                id="receipt"
                src={`/receipt/${id}`}
                style={{ display: 'none' }}
                title="Receipt"
            />
            <button onClick={() => printIframe('receipt')}>
                {isLoading ? 'Loading...' : 'Print Receipt'}
            </button>
        </>
    );
}

export default function Checkout() {
    const {historyId} = useParams();
    // const [product, setProduct] = useState({});
    // const [attachmentUrls, setAttachmentUrls] = useState([]);
    // const [isLoadingData, setIsLoadingData] = useState(true);

    // useEffect(() => {
    //     function loadProduct() {
    //         return API.get("kmc", `/products/${productId}`);
    //     }
    //
    //     async function getUrls(attachments) {
    //         var urls = [];
    //         for (var i = 0; i < attachments.length; i++) {
    //             const url = await Storage.vault.get(attachments[i]);
    //             urls.push(url);
    //         }
    //
    //         return urls;
    //     }
    //
    //     async function onLoad() {
    //         try {
    //             const response = await loadProduct();
    //             if (response.code != '200') {
    //                 onError(response.message);
    //                 return;
    //             } else {
    //                 const {attachments} = response.product;
    //                 if (attachments != null) {
    //                     setAttachmentUrls(await getUrls(attachments));
    //                 } else {
    //                     setAttachmentUrls([]);
    //                 }
    //                 setProduct(response.product);
    //                 setIsLoadingData(false);
    //             }
    //         } catch (e) {
    //             onError(e);
    //         }
    //     }
    //
    //     onLoad();
    // }, [productId]);

    return (
        <div>
            <PaymentConfirmation id={historyId} />
        </div>
    );
}
