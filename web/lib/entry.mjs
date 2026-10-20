// Bundles Epic's official Pixel Streaming UE5.5 frontend libraries into a
// browser-global script so play.html can use window.pixelstreaming.
import { PixelStreaming } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.5';
import { Config, Flags, TextParameters, NumericParameters, OptionParameters } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.5';
import * as UI from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5';

window.pixelstreaming = {
    PixelStreaming,
    Config,
    Flags,
    TextParameters,
    NumericParameters,
    OptionParameters,
    ...UI
};

export default window.pixelstreaming;
