import { PropsWithChildren, useEffect } from "react";
import { AppProps as NextAppProps } from "next/app";
import Modal from "react-modal";
import Head from "next/head";
import CENNZApiProvider from "@refactor/providers/CENNZApiProvider";
import SupportedAssetsProvider from "@refactor/providers/SupportedAssetsProvider";
import SupportedWalletProvider from "@refactor/providers/SupportedWalletProvider";
import CENNZExtensionProvider from "@refactor/providers/CENNZExtensionProvider";
import UserAgentProvider from "@refactor/providers/UserAgentProvider";
import { AppProps } from "@refactor/utils/fetchAppProps";
import SellFlowProvider from "@refactor/providers/SellFlowProvider";
import MintFlowProvider from "@refactor/providers/MintFlowProvider";
import DialogProvider from "@refactor/providers/DialogProvider";
import { useRouter } from "next/router";
import trackPageview from "@refactor/utils/trackPageview";
import { DefaultSeo } from "next-seo";

Modal.setAppElement("#__next");

type ComponentProps = {
	appProps: AppProps;
} & NextAppProps;

export default function App({
	Component,
	pageProps,
}: PropsWithChildren<ComponentProps>) {
	const { events } = useRouter();
	const { appProps, ...props } = pageProps;
	const supportedAssets = appProps?.supportedAssets || [];

	useEffect(() => {
		if (!events) return;

		events.on("routeChangeComplete", trackPageview);
		return () => {
			events.off("routeChangeComplete", trackPageview);
		};
	}, [events]);

	return (
		<DialogProvider>
			<UserAgentProvider>
				<CENNZExtensionProvider>
					<CENNZApiProvider
						endpoint={process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT}>
						<SupportedAssetsProvider assets={supportedAssets}>
							<SupportedWalletProvider>
								<MintFlowProvider>
									<SellFlowProvider>
										<DefaultSeo
											titleTemplate="Litho | %s"
											title="Litho"
											description="Launch into the Lithoverse. Your place to create and exchange NFTs."
											twitter={{
												handle: "@CENNZnet",
												site: "@Lithoverse",
												cardType: "summary_large_image",
											}}
											openGraph={{
												images: [
													{
														url: `https://${
															process.env.NEXT_PUBLIC_VERCEL_URL ||
															"lithoverse.xyz"
														}/assets/litho-share.png`,
														width: 800,
														height: 421,
													},
												],
											}}
										/>
										<Head>
											<title>Litho</title>
											<link rel="shortcut icon" href="/favicon.ico" />
											<link
												rel="stylesheet"
												href="https://use.typekit.net/txj7ase.css"
											/>
										</Head>
										<Component {...props} />
									</SellFlowProvider>
								</MintFlowProvider>
							</SupportedWalletProvider>
						</SupportedAssetsProvider>
					</CENNZApiProvider>
				</CENNZExtensionProvider>
			</UserAgentProvider>
		</DialogProvider>
	);
}
