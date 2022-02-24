import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import LithoSVG from "@refactor/assets/vectors/litho-logo.svg";
import WalletButton from "@refactor/components/WalletButton";
import Link from "@refactor/components/Link";
import { useMintFlow } from "@refactor/providers/MintFlowProvider";
import { useCallback } from "react";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";

const bem = createBEMHelper(require("./Header.module.scss"));

type ComponentProps = {};

export default function Header({
	className,
	...props
}: DOMComponentProps<ComponentProps, "header">) {
	const { startMinting } = useMintFlow();
	const onCreateClick = useCallback(
		(event) => {
			event.preventDefault();
			startMinting();
		},
		[startMinting]
	);
	const { account } = useWallet();

	return (
		<header {...props} className={bem("header", className)}>
			<Link href="/" className={bem("logo")}>
				<LithoSVG />
			</Link>
			<nav className={bem("nav")}>
				<Link href="https://litho.a2hosted.com" className={bem("navLink")}>
					Resources
				</Link>
				<Link
					href="/marketplace"
					className={bem("navLink")}
					activeClassName={bem("navLink", { active: true })}>
					Marketplace
				</Link>
				<Link
					href="#"
					onClick={onCreateClick}
					className={bem("navLink")}
					activeClassName={bem("navLink", { active: true })}>
					Mint NFTs
				</Link>
				{account && (
					<Link
						href="/me"
						className={bem("navLink")}
						activeClassName={bem("navLink", { active: true })}>
						My Profile
					</Link>
				)}

				<WalletButton className={bem("walletButton")} />
			</nav>
		</header>
	);
}
