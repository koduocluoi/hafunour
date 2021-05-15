import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EditableProductPage from "../../components/EditableProductPage";
import { API, Storage } from "aws-amplify";
import { onError } from "../../libs/errorLib";
import "./index.css";

export default function EditProduct() {
    const {productId} = useParams();
    const [product, setProduct] = useState({});
    const [attachmentUrls, setAttachmentUrls] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        function loadProduct() {
            return API.get("kmc", `/products/${productId}`);
        }

        async function getUrls(attachments) {
            var urls = [];
            for (var i = 0; i < attachments.length; i++) {
                const url = await Storage.vault.get(attachments[i]);
                urls.push(url);
            }

            return urls;
        }

        async function onLoad() {
            try {
                const response = await loadProduct();
                if (response.code != '200') {
                    onError(response.message);
                    return;
                } else {
                    const {attachments} = response.product;
                    if (attachments != null) {
                        setAttachmentUrls(await getUrls(attachments));
                    } else {
                        setAttachmentUrls([]);
                    }
                    setProduct(response.product);
                    setIsLoadingData(false);
                }
            } catch (e) {
                onError(e);
            }
        }

        onLoad();
    }, [productId]);

    return (
        isLoadingData
            ? <div></div>
            : <EditableProductPage
                attachmentUrls={attachmentUrls}
                product={product}
                isEdit={true}
            />
    );
}
