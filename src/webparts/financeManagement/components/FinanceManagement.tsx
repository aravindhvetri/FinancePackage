import * as React from 'react';
import styles from './FinanceManagement.module.scss';
import type { IFinanceManagementProps } from './IFinanceManagementProps';

import {ISPFXContext, sp } from "@pnp/pnpjs";
import MainComponent from './MainComponents/MainComponent';

export default class FinanceManagement extends React.Component<IFinanceManagementProps> {
 
    constructor(prop: IFinanceManagementProps, state: {}) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as ISPFXContext,
    });
  }
 public render(): React.ReactElement<IFinanceManagementProps> {
    return (
     <div><MainComponent context={this.props.context}/></div>
    );
  }
}
