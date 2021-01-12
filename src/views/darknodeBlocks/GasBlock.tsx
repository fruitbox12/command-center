import React, { useCallback, useMemo, useState } from "react";

import { Tabs } from "../Tabs";
import { Block, BlockBody, BlockTitle } from "./Block";

import { ReactComponent as FlameIcon } from "../../styles/images/icon-flame.svg";
import { Currency, CurrencyIcon } from "@renproject/react-components";
import { AnyTokenBalance } from "../../controllers/common/TokenBalance";
import BigNumber from "bignumber.js";
import { catchBackgroundException } from "../../lib/react/errors";
import { fromWei } from "web3-utils";

interface Props {
    darknodeBalance: BigNumber | null;
    loggedIn: boolean;
    userBalance: BigNumber | null;
    maxCallback?: () => Promise<BigNumber>;
    topUpCallBack: (value: string) => Promise<void>;
}

enum Tab {
    Add = "Add",
    Withdraw = "Withdraw (CLI)",
}

enum ResultMessage {
    Null,
    NoAccount,
    InsufficientBalance,
}

export const GasBlock: React.FC<Props> = ({
    darknodeBalance,
    loggedIn,
    userBalance: balance,
    maxCallback,
    topUpCallBack,
}) => {
    const darknodeBalanceString = useMemo(
        () =>
            darknodeBalance
                ? darknodeBalance
                      .div(new BigNumber(Math.pow(10, 18)))
                      .toFixed(3)
                : null,
        [darknodeBalance],
    );

    const [value, setValue] = useState("");
    const [resultMessage, setResultMessage] = useState<ResultMessage>(
        ResultMessage.Null,
    );
    const [disabled, setDisabled] = useState(false);
    const [pending, setPending] = useState(false);

    const balanceInEth = useMemo(
        () =>
            balance
                ? new BigNumber(fromWei(balance.toFixed(), "ether").toString())
                : balance,
        [balance],
    );

    const handleChange = useCallback(
        (newValue: string): void => {
            setValue(newValue.toString());

            // If input is invalid, show an error.
            if (isNaN(parseFloat(newValue)) || parseFloat(newValue) <= 0) {
                setDisabled(true);
                setResultMessage(ResultMessage.Null);
            } else if (!loggedIn) {
                setResultMessage(ResultMessage.NoAccount);
            } else if (balanceInEth && balanceInEth.isLessThan(newValue)) {
                setResultMessage(ResultMessage.InsufficientBalance);
                setDisabled(true);
            } else if (resultMessage || disabled) {
                setResultMessage(ResultMessage.Null);
                setDisabled(false);
            }
        },
        [loggedIn, disabled, balanceInEth, resultMessage],
    );

    const handleMax = useCallback(async (): Promise<void> => {
        if (!loggedIn) {
            setResultMessage(ResultMessage.NoAccount);
            return;
        }

        try {
            let max: BigNumber;
            if (maxCallback) {
                max = await maxCallback();
            } else {
                max = balanceInEth || new BigNumber(0);
            }
            handleChange(max.toFormat());
        } catch (error) {
            catchBackgroundException(
                error,
                "Error in TopUpController > handleMax",
            );
        }
    }, [loggedIn, handleChange, maxCallback]);

    const sendFunds = useCallback(async (): Promise<void> => {
        setResultMessage(ResultMessage.Null);
        setPending(true);

        if (!loggedIn) {
            setResultMessage(ResultMessage.NoAccount);
            setPending(false);
            return;
        }

        try {
            await topUpCallBack(value);
            setValue((currentValue) =>
                currentValue === value ? "0" : currentValue,
            );
        } catch (error) {
            // Ignore.
        }

        setPending(false);
    }, [loggedIn, topUpCallBack, value]);

    const [clickedMax, setClickedMax] = useState(false);

    const handleChangeEvent = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            handleChange(event.target.value);
        },
        [handleChange],
    );

    const [tab, setTab] = useState<string>(Tab.Add);

    const onSubmit = useMemo(
        () => (event: React.MouseEvent<HTMLFormElement, MouseEvent>) => {
            event.preventDefault();
            sendFunds();
        },
        [sendFunds],
    );

    const onClickMax = useCallback(() => {
        setClickedMax(true);
        handleMax().finally(() => setClickedMax(false));
    }, [handleMax]);

    return (
        <Block className={`gas-block`}>
            <BlockTitle>
                <h3>
                    <FlameIcon />
                    Gas Balance
                </h3>
            </BlockTitle>

            {darknodeBalanceString ? (
                <div className="block--advanced">
                    <div className="block--advanced--top">
                        <>
                            <span className="gas-block--advanced--value">
                                {darknodeBalanceString}
                            </span>
                            <span className="gas-block--advanced--unit">
                                ETH
                            </span>
                        </>
                    </div>
                    <div className="block--advanced--bottom">
                        <div className="topup">
                            <Tabs
                                selected={tab}
                                onTab={setTab}
                                tabs={{
                                    [Tab.Add]: (
                                        <BlockBody>
                                            <label>
                                                {resultMessage ? (
                                                    <p className="topup--input--warning warning">
                                                        {resultMessage ===
                                                        ResultMessage.NoAccount ? (
                                                            <>
                                                                Please connect
                                                                your Web3 wallet
                                                                first.
                                                            </>
                                                        ) : resultMessage ===
                                                          ResultMessage.InsufficientBalance ? (
                                                            <>
                                                                Insufficient
                                                                balance.{" "}
                                                                {balanceInEth ? (
                                                                    <>
                                                                        Maximum
                                                                        deposit:{" "}
                                                                        <span
                                                                            className="pointer"
                                                                            onClick={
                                                                                handleMax
                                                                            }
                                                                        >
                                                                            <CurrencyIcon
                                                                                currency={
                                                                                    Currency.ETH
                                                                                }
                                                                            />
                                                                            <AnyTokenBalance
                                                                                amount={
                                                                                    balanceInEth
                                                                                }
                                                                                digits={
                                                                                    3
                                                                                }
                                                                                decimals={
                                                                                    0
                                                                                }
                                                                            />
                                                                        </span>
                                                                    </>
                                                                ) : null}
                                                            </>
                                                        ) : null}
                                                    </p>
                                                ) : (
                                                    <p className="topup--title">
                                                        Enter the amount of
                                                        Ether you would like to
                                                        deposit.
                                                    </p>
                                                )}
                                                <form
                                                    className="topup--form"
                                                    onSubmit={onSubmit}
                                                >
                                                    <div className="topup--input">
                                                        <input
                                                            disabled={pending}
                                                            type="text"
                                                            value={value}
                                                            min={0}
                                                            onChange={
                                                                handleChangeEvent
                                                            }
                                                            placeholder="Amount in ETH"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="topup--max"
                                                            disabled={
                                                                clickedMax
                                                            }
                                                            onClick={onClickMax}
                                                        >
                                                            MAX
                                                        </button>
                                                    </div>
                                                    {pending ? (
                                                        <button disabled>
                                                            Depositing...
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="submit"
                                                            className="topup--submit hover green"
                                                            disabled={disabled}
                                                        >
                                                            <span>Deposit</span>
                                                        </button>
                                                    )}
                                                </form>
                                            </label>
                                        </BlockBody>
                                    ),
                                    "Withdraw (CLI)": (
                                        <BlockBody>
                                            <label>
                                                <div className="topup--title">
                                                    Funds can be withdrawn
                                                    through the Darknode CLI.
                                                </div>
                                            </label>
                                        </BlockBody>
                                    ),
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </Block>
    );
};