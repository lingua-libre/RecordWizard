<div class="mwe-rw-content-title">
	<h3>{{_ "mwe-recwiz-publish-title"}}</h3>
</div>
<div class="mwe-rw-section-group"><!--  mwe-rws-video mwe-rws-play -->
	<section>
		<ul id="mwe-rwp-list" class="mwe-rw-list">
			<li v-for="(word, index) in words" :key="index" v-if="isSelectable( word )" :class="'mwe-rwp-' + status[ word ] + ( errors[ word ] !== false ? ' mwe-rw-error' : '' ) + ( selectedArray[ index ] ? selectedArray[ index ] : '' )" @click.self="selectWord( index )">
				<ooui-checkbox v-model="checkboxes[ word ]" :disabled="state.isPublishing"></ooui-checkbox>
				<label for="mwe-rwp-cb1-input" v-html="word" :title="errors[ word ]" @click="selectWord( index )"></label>
			</li>
		</ul>
	</section>
	<section>
		<div id="mwe-rwp-info" class="mwe-rw-info">
			{{&_ "mwe-recwiz-publish-info"}}
		</div>
		<div id="mwe-rwp-core" class="mwe-rw-core">
			<div id="mwe-rwp-itembox" class="mwe-rw-itembox">
				<ooui-button id="mwe-rwp-prev" icon="previous" :framed="false" @click="moveBackward"></ooui-button>
				<div id="mwe-rwp-item" class="mwe-rw-item" v-html="words[ selected ]"></div>
				<ooui-button id="mwe-rwp-next" icon="next" :framed="false" @click="moveForward"></ooui-button>
			</div>
			<audio v-if="metadata.media === 'audio'" :src="mediaUrl" controls autoplay></audio>
			<video v-if="metadata.media === 'video'" :src="mediaUrl" controls autoplay></video>
		</div>
		<div id="mwe-rwp-actions" class="mwe-rw-actions">
			<ooui-progressbar :value="(100 * statusCount.done / total).toString()"></ooui-progressbar>
			<div id="mwe-rwp-counter" class="mwe-rw-counter">
				<span v-html="statusCount.done"></span> / <span v-html="total"></span>
				<span class="mwe-rw-othercounter">
					<span class="mwe-rw-errorcounter" v-show="statusCount.error > 0">
						<i></i>
						<span v-html="statusCount.error"></span>
					</span>
					<span class="mwe-rw-progresscounter" v-show="statusCount.uploading + statusCount.finalizing > 0">
						<i></i>
						<span v-html="statusCount.uploading + statusCount.finalizing"></span>
					</span>
				</span>
			</div>
		</div>
	</section>
</div>
