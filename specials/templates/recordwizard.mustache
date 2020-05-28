<h2 id="mwe-rw-title">{{_ 'mwe-recwiz-title'}}</h2>
<div id="mwe-rw">
	<ul id="mwe-rw-steps">
		<li :class="state.step === 'tutorial' ? 'active' : null"><span class="mwe-rw-step-marker">1</span><span class="mwe-rw-step-check"><img src="{{wgExtensionAssetsPath}}/RecordWizard/icons/done.svg" /></span>{{_ "mwe-recwiz-step-tutorial"}}</li>
		<li :class="state.step === 'speaker' ? 'active' : null"><span class="mwe-rw-step-marker">2</span><span class="mwe-rw-step-check"><img src="{{wgExtensionAssetsPath}}/RecordWizard/icons/done.svg" /></span>{{_ "mwe-recwiz-step-speaker"}}</li>
		<li :class="state.step === 'details' ? 'active' : null"><span class="mwe-rw-step-marker">3</span><span class="mwe-rw-step-check"><img src="{{wgExtensionAssetsPath}}/RecordWizard/icons/done.svg" /></span>{{_ "mwe-recwiz-step-details"}}</li>
		<li :class="state.step === 'studio' ? 'active' : null"><span class="mwe-rw-step-marker">4</span><span class="mwe-rw-step-check"><img src="{{wgExtensionAssetsPath}}/RecordWizard/icons/done.svg" /></span>{{_ "mwe-recwiz-step-studio"}}</li>
		<li :class="state.step === 'publish' ? 'active' : null"><span class="mwe-rw-step-marker">5</span><span class="mwe-rw-step-check"><img src="{{wgExtensionAssetsPath}}/RecordWizard/icons/done.svg" /></span>{{_ "mwe-recwiz-step-publish"}}</li>
	</ul>

	<div id="mwe-rw-main">
		<div id="mwe-rw-spinner">
			<img src="{{wgExtensionAssetsPath}}/RecordWizard/icons/spinner.svg" width="40" height="40" />
		</div>
		<div id="mwe-rw-content" style="display: none;">
			<div class="mwe-rw-content" id="mwe-rw-tutorial" v-if="state.step === 'tutorial'">{{>tutorial}}</div>
			<div class="mwe-rw-content" id="mwe-rw-speaker" v-if="state.step === 'speaker'">{{>speaker}}</div>
			<div class="mwe-rw-content" id="mwe-rw-details" v-if="state.step === 'details'">{{>details}}</div>
			<div class="mwe-rw-content" id="mwe-rw-studio" v-if="state.step === 'studio'">{{>studio}}</div>
			<div class="mwe-rw-content" id="mwe-rw-publish" v-if="state.step === 'publish'">{{>publish}}</div>
		</div>
		<div id="mwe-rw-navigation">
			<ooui-button id="mwe-rw-cancel" label="{{_ "mwe-recwiz-cancel"}}" :framed="false" @click="cancel()"></ooui-button>
			<ooui-button id="mwe-rw-prev" label="{{_ "mwe-recwiz-previous"}}" flags="progressive" :framed="false" icon="previous" :disabled="prevDisabled" @click="prev()" v-show="state.step !== 'tutorial' && state.isPublishing === false"></ooui-button>
			<ooui-button id="mwe-rw-commonsfilelist" label="{{_ "mwe-recwiz-publish-commonsfilelist"}}" flags="progressive" :framed="false" icon="logoWikimediaCommons" :href="fileListUrl" target="_blank" @click="openFileList()" v-show="state.isPublishing === true"></ooui-button>
			<ooui-button id="mwe-rw-retry" label="{{_ "mwe-recwiz-retry"}}" icon="reload" @click="retry()" v-show="showRetry"></ooui-button>
			<ooui-button id="mwe-rw-next" label="{{_ "mwe-recwiz-next"}}" flags="progressive primary" icon="next" :disabled="nextDisabled" @click="next()" v-show="state.isBrowserReady && state.step !== 'publish'"></ooui-button>
			<ooui-button id="mwe-rw-publish" label="{{_ "mwe-recwiz-publish"}}" flags="progressive primary" icon="upload" :disabled="hasPendingRequests()" @click="next()" v-show="state.step === 'publish' && ( state.isPublishing === false || hasPendingRequests() === true )"></ooui-button>
			<ooui-button id="mwe-rw-restart" label="{{_ "mwe-recwiz-restart"}}" flags="progressive primary" icon="next" @click="next()" v-show="state.isPublishing === true && hasPendingRequests() === false"></ooui-button>
		</div>
	</div>
</div>
<!--v2-->
