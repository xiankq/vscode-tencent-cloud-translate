import { workspace } from 'vscode';
import { ITranslate, ITranslateOptions } from 'comment-translate-manager';

const tencentcloud = require("tencentcloud-sdk-nodejs");
const PREFIXCONFIG = 'tencentCloudTranslate';

const langMaps: Map<string, string> = new Map([
    ['zh-CN', 'zh'],
    ['zh-TW', 'zh'],
]);

function convertLang(src: string) {
    if (langMaps.has(src)) {
        return langMaps.get(src);
    }
    return src.toLocaleLowerCase();
}

export function getConfig<T>(key: string): T | undefined {
    let configuration = workspace.getConfiguration(PREFIXCONFIG);
    return configuration.get<T>(key);
}


interface TmtTranslateOption {
    secretId?: string;
    secretKey?: string;
    region?: string;
    projectId?: number;
}
interface Response {
    TargetText: string;
    Source: string;
    Target: string;
    RequestId: string;

}
export class TmtTranslate implements ITranslate {
    get maxLen(): number {
        return 3000;
    }

    private _defaultOption: TmtTranslateOption;
    constructor() {
        this._defaultOption = this.createOption();
        workspace.onDidChangeConfiguration(async eventNames => {
            if (eventNames.affectsConfiguration(PREFIXCONFIG)) {
                this._defaultOption = this.createOption();
            }
        });
    }

    createOption() {
        const defaultOption: TmtTranslateOption = {
            secretId: getConfig<string>('secretId'),
            secretKey: getConfig<string>('secretKey'),
            region: getConfig<string>('region'),
            projectId: getConfig<number>('projectId'),
        };
        return defaultOption;
    }

    async translate(sourceText: string, { to = 'auto' }: ITranslateOptions) {
        const { secretId, secretKey, region, projectId } = this._defaultOption ?? {};
        if (!secretId || !secretKey) {
            throw new Error('Please check the configuration of secretId and secretKey!');
        }
        const TmtClient = tencentcloud.tmt.v20180321.Client;
        console.log(this._defaultOption);

        const clientConfig = {
            credential: {
                secretId,
                secretKey,
            },
            profile: {
                httpProfile: {
                    endpoint: "tmt.tencentcloudapi.com",
                },
            },
            region: region || 'ap-guangzhou',
        };

        const client = new TmtClient(clientConfig);
        const params = {
            ProjectId: projectId || 0,
            Source: 'auto',
            SourceText: sourceText,
            Target: convertLang(to),
        };
        const res: Response = await client.TextTranslate(params);
        return res.TargetText;
    }


    link(content: string, { to = 'auto' }: ITranslateOptions) {
        let str = `https://translate.google.cn/?sl=auto&tl=${to}&text=${encodeURIComponent(content)}&op=translate`;
        return `[Google](${str})`;
    }

    isSupported(src: string) {
        return true;
    }
}





