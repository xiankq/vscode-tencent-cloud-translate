import { ITranslateRegistry } from 'comment-translate-manager';
import * as vscode from 'vscode';
import { TmtTranslate } from './tmtTranslate';

export function activate(context: vscode.ExtensionContext) {


    //Expose the plug-in
    return {
        extendTranslate: function (registry: ITranslateRegistry) {
            registry('tencentCloud', TmtTranslate);
        }
    };
}

// this method is called when your extension is deactivated
export function deactivate() { }
