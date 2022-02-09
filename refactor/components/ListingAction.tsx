import {
	DOMComponentProps,
	NFTListingId,
	NFTId,
	NFTListingType,
} from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Button from "@refactor/components/Button";
import { useCallback, useState, useEffect } from "react";
import useNFTCancel from "@refactor/hooks/useNFTCancel";
import useNFTBuy from "@refactor/hooks/useNFTBuy";
import useNFTBid from "@refactor/hooks/useNFTBid";
import Link from "@refactor/components/Link";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import Text from "@refactor/components/Text";
import AssetInput from "@refactor/components/AssetInput";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { useSellFlow } from "@refactor/providers/SellFlowProvider";

const bem = createBEMHelper(require("./ListingAction.module.scss"));

type BuyComponentProps = {
	listingId: NFTListingId;
	onActionComplete?: (action: string) => void;
};
export function BuyAction({
	listingId,
	onActionComplete,
}: DOMComponentProps<BuyComponentProps, "div">) {
	const [busy, setBusy] = useState<boolean>(false);
	const buyListing = useNFTBuy();
	const onBuyClick = useCallback(async () => {
		const confirmed = confirm("Are you sure?");
		if (!confirmed) return;
		setBusy(true);
		const status = await buyListing(listingId);
		if (status === "cancelled") return setBusy(false);
		onActionComplete?.("buy");
	}, [buyListing, listingId, onActionComplete]);

	return (
		<div className={bem("buyAction")}>
			<Button
				className={bem("actionButton")}
				onClick={onBuyClick}
				disabled={busy}>
				{busy ? "Processing" : "Buy Now"}
			</Button>
		</div>
	);
}

type BidComponentProps = {
	listingId: NFTListingId;
	currentBid: number;
	paymentAssetId: number;
	onActionComplete?: (action: string) => void;
};
export function BidAction({
	listingId,
	currentBid,
	paymentAssetId,
	onActionComplete,
}: DOMComponentProps<BidComponentProps, "div">) {
	const [showInput, setShowInput] = useState<boolean>(false);
	const onPlaceBidClick = useCallback(() => {
		setShowInput((showInput) => !showInput);
	}, []);

	const onCancelClick = useCallback(() => {
		setShowInput(false);
	}, []);
	const { getMinimumStep, findAsset } = useAssets();
	const [step] = getMinimumStep?.(paymentAssetId) || [1];
	const minimumBid = currentBid + step;

	const assetInfo = findAsset(paymentAssetId);
	const bidListing = useNFTBid();
	const [busy, setBusy] = useState<boolean>(false);
	const onFormSubmit = useCallback(
		async (event) => {
			event?.preventDefault?.();
			const data = new FormData(event.target);
			const confirmed = confirm("Are you sure?");
			if (!confirmed) return;
			setBusy(true);
			const status = await bidListing(
				listingId,
				(data.get("bid") as any) * Math.pow(10, assetInfo.decimals)
			);
			if (status === "cancelled") return setBusy(false);
			onActionComplete?.("bid");
		},
		[bidListing, listingId, assetInfo, onActionComplete]
	);

	useEffect(() => {
		setShowInput(false);
		setBusy(false);
	}, [currentBid]);

	return (
		<>
			{!showInput && (
				<div className={bem("bidAction")}>
					<Button className={bem("actionButton")} onClick={onPlaceBidClick}>
						Place A Bid
					</Button>
				</div>
			)}

			{showInput && (
				<form className={bem("form")} onSubmit={onFormSubmit}>
					<Text variant="headline5" className={bem("formHeadline")}>
						Enter a bid
					</Text>

					<AssetInput
						name="bid"
						required={true}
						assetId={paymentAssetId}
						min={minimumBid}
						placeholder={`Minimum bid of ${minimumBid}`}
						className={bem("formInput")}
						focusOnInit={true}
						disabled={busy}
					/>

					<div className={bem("formActions")}>
						<Button
							className={bem("cancelButton")}
							variant="hollow"
							onClick={onCancelClick}
							showProgress={false}
							disabled={busy}>
							Cancel
						</Button>

						<Button className={bem("bidButton")} type="submit" disabled={busy}>
							{busy ? "Processing" : "Confirm Bid"}
						</Button>
					</div>
				</form>
			)}
		</>
	);
}

type CancelComponentProps = {
	listingId: NFTListingId;
	onActionComplete?: (action: string) => void;
	disabled?: boolean;
};
export function RemoveAction({
	listingId,
	onActionComplete,
	disabled = false,
}: DOMComponentProps<CancelComponentProps, "div">) {
	const [busy, setBusy] = useState<boolean>(false);
	const cancelListing = useNFTCancel();
	const onCancelClick = useCallback(async () => {
		setBusy(true);
		const status = await cancelListing(listingId);
		console.log({ status });
		if (status === "cancelled") return setBusy(false);
		onActionComplete?.("cancel");
	}, [cancelListing, listingId, onActionComplete]);

	return (
		<div className={bem("cancelAction")}>
			<Button
				className={bem("actionButton")}
				disabled={busy || disabled}
				onClick={onCancelClick}
				showProgress={busy}>
				{busy ? "Processing" : "Remove Listing"}
			</Button>

			<div className={bem("note")}>
				Auction is in progress, remove listing is disabled
			</div>
		</div>
	);
}

type SellComponentProps = {
	tokenId: NFTId;
	onActionComplete?: (action: string) => void;
};
export function SellAction({
	tokenId,
	onActionComplete,
}: DOMComponentProps<SellComponentProps, "div">) {
	const { startListing } = useSellFlow();

	const onStartClick = useCallback(async () => {
		await startListing(tokenId);
		onActionComplete?.("sell");
	}, [startListing, tokenId, onActionComplete]);

	return (
		<div className={bem("sellAction")}>
			<Button className={bem("actionButton")} onClick={onStartClick}>
				Start Listing
			</Button>
		</div>
	);
}

type ConnectComponentProps = {};
export function ConnectAction({}: DOMComponentProps<
	ConnectComponentProps,
	"div"
>) {
	const { connectWallet } = useWallet();
	const [busy, setBusy] = useState<boolean>(false);
	const onConnectClick = useCallback(() => {
		setBusy(true);
		connectWallet(() => setBusy(false));
	}, [connectWallet]);

	return (
		<div className={bem("connectAction")}>
			<Button
				className={bem("actionButton")}
				disabled={busy}
				onClick={onConnectClick}>
				{busy ? "Connecting" : "Connect Wallet"}
			</Button>
		</div>
	);
}

type TopUpComponentProps = {
	type: NFTListingType;
};
export function TopUpAction({
	type,
}: DOMComponentProps<TopUpComponentProps, "div">) {
	return (
		<div className={bem("removeAction")}>
			<Link href="https://www.mexc.com">
				<Button className={bem("actionButton")}>
					{type === "Fixed Price" && "Top up to buy"}
					{type === "Auction" && "Top up to bid"}
				</Button>
			</Link>
		</div>
	);
}