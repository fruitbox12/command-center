// tslint:disable:no-object-literal-type-assertion

import * as Sentry from "@sentry/browser";

import RenExSDK, { OrderSettlement } from "@renex/renex";

import { List, Map, OrderedMap } from "immutable";

import { Record } from "@Library/general/record";
import { Wallet } from "@Library/wallets/wallet";
import BigNumber from "bignumber.js";
// import { number } from "prop-types";

import { Token } from "../components/legacy/lib/tokens";

export interface Serializable<T> {
    serialize(): string;
    deserialize(str: string): T;
}

export interface ApplicationData {
    trader: TraderData;
    alert: AlertData;
    popup: PopupData;
    statistics: StatisticsData;
}

export class TraderData extends Record({
    // Login data
    address: null as string | null,
    sdk: null as RenExSDK | null,
    wallet: null as Wallet | null,
}) implements Serializable<TraderData> {
    public serialize(): string {
        return JSON.stringify({
            // address: this.address,
        });
    }

    public deserialize(str: string): TraderData {
        const next = this;
        try {
            // const data = JSON.parse(str);
            // next = next.set("address", data.address);
        } catch (err) {
            console.error(err);
            Sentry.captureException(`cannot deserialize local storage: ${err}`);
        }
        return next;
    }
}

export type Settlements = OrderedMap<OrderSettlement, boolean>;

export enum AlertType {
    Error = "error",
    Warning = "warning",
    Success = "success"
}

export enum LabelType {
    Info = "info",
    Warning = "warning"
}

export class Alert extends Record({
    alertType: AlertType.Warning,
    message: "", // TODO: Allow for links
}) { }

export class AlertData extends Record({
    alert: { message: "" } as Alert,
    pendingAlerts: Map<string, () => Promise<void>>(),
}) { }

export class PopupData extends Record({
    dismissible: true,
    onCancel: (() => null) as () => void,
    popup: null as JSX.Element | null,
}) { }

export class StatisticsData extends Record({
    darknodeCount: null as BigNumber | null,
    orderCount: null as BigNumber | null,

    darknodeDetails: Map<string, DarknodeDetails>(),
    darknodeList: List<string>(),

    // Network details
    // minimumBond: 0,

    // Interaction data
    selectedDarknode: null as string | null,
}) { }


export class DarknodeDetails extends Record({
    ID: "" as string,
    multiAddress: "" as string,
    publicKey: "" as string,
    ethBalance: new BigNumber(0),
    feesEarned: OrderedMap<Token, string>(),

    averageGasUsage: 0,
    lastTopUp: null,
    expectedExhaustion: null,

    peers: 0,
    registrationStatus: "",
}) { }
