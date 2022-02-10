import {
	InjectedExtension,
	InjectedAccountWithMeta,
} from "@polkadot/extension-inject/types";
import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import type * as Extension from "@polkadot/extension-dapp";
import { useUserAgent } from "@refactor/providers/UserAgentProvider";
import { useDialog } from "@refactor/providers/DialogProvider";
import Link from "@refactor/components/Link";
import Button from "@refactor/components/Button";

type ExtensionContext = typeof Extension & {
	accounts: Array<InjectedAccountWithMeta>;
	extension: InjectedExtension;
	promptInstallExtension: () => void;
};

const CENNZExtensionContext = createContext<ExtensionContext>(
	{} as ExtensionContext
);

type ProviderProps = {};

export default function CENNZExtensionProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const { browser } = useUserAgent();
	const [module, setModule] = useState<typeof Extension>();
	const [extension, setExtension] = useState<InjectedExtension>();
	const [accounts, setAccounts] = useState<Array<InjectedAccountWithMeta>>();
	const { show, close } = useDialog();

	const promptInstallExtension = useCallback(async () => {
		const url =
			browser.name === "Firefox"
				? "https://addons.mozilla.org/en-US/firefox/addon/cennznet-browser-extension/"
				: "https://chrome.google.com/webstore/detail/cennznet-extension/feckpephlmdcjnpoclagmaogngeffafk";

		const action = (
			<>
				<Button variant="hollow" onClick={close}>
					Dismiss
				</Button>
				<Link href={url} onClick={close}>
					<Button>{`Install Extension for ${browser.name}`}</Button>
				</Link>
			</>
		);

		await show({
			title: "Missing CENNZnet Extension",
			message:
				"Please install a compatible CENNZnet Extension for your browser and create at least one account to continue.",
			action,
		});
	}, [browser, show, close]);

	useEffect(() => {
		import("@polkadot/extension-dapp").then(setModule);
	}, []);

	useEffect(() => {
		if (!module) return;

		const getExtension = async () => {
			const { web3Enable, web3FromSource } = module;
			await web3Enable("Litho");
			const extension = await web3FromSource("cennznet-extension").catch(
				() => null
			);

			setExtension(extension);
		};

		getExtension();
	}, [module]);

	useEffect(() => {
		if (!module || !extension || !show) return;
		let unsubscibre: () => void;

		const fetchAccounts = async () => {
			const { web3Enable, web3Accounts, web3AccountsSubscribe } = module;

			await web3Enable("Litho");
			const accounts = (await web3Accounts()) || [];
			if (!accounts.length)
				return show({
					title: "Missing CENNZnet Account",
					message:
						"Please create at least one account in the CENNZnet extension to continue.",
				});

			setAccounts(accounts);

			unsubscibre = await web3AccountsSubscribe((accounts) => {
				setAccounts([...accounts]);
			});
		};

		fetchAccounts();

		return unsubscibre;
	}, [module, extension, show]);

	return (
		<CENNZExtensionContext.Provider
			value={{ ...module, accounts, extension, promptInstallExtension }}>
			{children}
		</CENNZExtensionContext.Provider>
	);
}

export function useCENNZExtension(): ExtensionContext {
	return useContext(CENNZExtensionContext);
}
