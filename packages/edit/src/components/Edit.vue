<template>
  <QuestionContainer
    v-bind="{
      type: manifest.name,
      icon: manifest.ui.icon,
      embedTypes,
      elementData,
      isDirty,
      isDisabled,
    }"
    :show-feedback="false"
    @cancel="updateData(element.data)"
    @save="save"
    @update="updateData($event)"
  >
    <div class="text-subtitle-2 mb-2">Answers</div>
    <VRow>
      <VCol cols="4" offset="1">
        <VTextField
          :model-value="elementData.headings.premise"
          :readonly="isDisabled"
          :rules="[(val: string) => !!val || 'Premise heading is required']"
          label="Premise heading"
          variant="outlined"
          @update:model-value="updateHeading('premise', $event)"
        />
      </VCol>
      <VCol cols="4" offset="2">
        <VTextField
          :model-value="elementData.headings.response"
          :readonly="isDisabled"
          :rules="[(val: string) => !!val || 'Response heading is required']"
          label="Response heading"
          variant="outlined"
          @update:model-value="updateHeading('response', $event)"
        />
      </VCol>
    </VRow>
    <VSlideYTransition group>
      <VRow
        v-for="(responseKey, premiseKey) in elementData.correct"
        :key="responseKey"
      >
        <VCol cols="4" offset="1">
          <VTextField
            :model-value="getPremiseContent(premiseKey)"
            :readonly="isDisabled"
            :rules="[(val: string) => !!val || 'Premise is required']"
            placeholder="Premise value..."
            variant="outlined"
            @update:model-value="updatePremiseContent(premiseKey, $event)"
          />
        </VCol>
        <VCol class="text-center" cols="2">
          <VIcon class="my-5" icon="mdi-arrow-right" size="x-small" />
        </VCol>
        <VCol cols="4">
          <VTextField
            :model-value="getResponseContent(responseKey)"
            :readonly="isDisabled"
            :rules="[(val: string) => !!val || 'Response is required']"
            placeholder="Response value..."
            variant="outlined"
            @update:model-value="updateResponseContent(responseKey, $event)"
          />
        </VCol>
        <VCol cols="1">
          <VBtn
            v-if="!isDisabled && pairsCount > PAIRS_LIMIT.MIN"
            aria-label="Remove answer"
            class="my-2"
            color="primary-darken-4"
            size="x-small"
            variant="text"
            icon
            @click="removeItem(premiseKey, responseKey)"
          >
            <VIcon icon="mdi-close" size="large" />
          </VBtn>
        </VCol>
      </VRow>
    </VSlideYTransition>
    <div class="d-flex justify-center mb-4">
      <VBtn
        v-if="!isDisabled && pairsCount < PAIRS_LIMIT.MAX"
        class="mt-4"
        color="primary-darken-4"
        prepend-icon="mdi-plus"
        variant="text"
        rounded
        @click="addItem"
      >
        Add Pair
      </VBtn>
    </div>
  </QuestionContainer>
</template>

<script lang="ts" setup>
import { computed, defineEmits, defineProps, reactive, watch } from 'vue';
import manifest, {
  Element,
  ElementData,
} from '@tailor-cms/ce-matching-question-manifest';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import pull from 'lodash/pull';
import { QuestionContainer } from '@tailor-cms/core-components';
import shuffle from 'lodash/shuffle';
import size from 'lodash/size';
import { v4 as uuid } from 'uuid';

const PAIRS_LIMIT = Object.freeze({
  MIN: 2,
  MAX: 10,
});

const emit = defineEmits(['save']);
const props = defineProps<{
  embedTypes: any[];
  element: Element;
  isFocused: boolean;
  isDisabled: boolean;
}>();

const elementData = reactive<ElementData>(cloneDeep(props.element.data));

const isDirty = computed(() => !isEqual(elementData, props.element.data));
const pairsCount = computed(() => size(elementData.correct));

const getPremiseContent = (key: string) => getPremiseItem(key)?.value;
const getResponseContent = (key: string) => getResponseItem(key)?.value;
const getPremiseItem = (key: string) => find(elementData.premises, { key });
const getResponseItem = (key: string) => find(elementData.responses, { key });

const updateHeading = (key: string, value: string) => {
  elementData.headings[key] = value;
};

const updatePremiseContent = (key: string, value: string) => {
  const premise = getPremiseItem(key);
  if (premise) premise.value = value;
  elementData.premises = shuffle(elementData.premises);
};

const updateResponseContent = (key: string, value: string) => {
  const response = getResponseItem(key);
  if (response) response.value = value;
  elementData.responses = shuffle(elementData.responses);
};

const addItem = () => {
  const premiseKey = uuid();
  const responseKey = uuid();
  elementData.premises.push({ key: premiseKey, value: '' });
  elementData.responses.push({ key: responseKey, value: '' });
  elementData.correct[premiseKey] = responseKey;
  elementData.premises = shuffle(elementData.premises);
  elementData.responses = shuffle(elementData.responses);
};

const removeItem = (premiseKey: string, responseKey: string) => {
  pull(elementData.premises, getPremiseItem(premiseKey));
  pull(elementData.responses, getResponseItem(responseKey));
  delete elementData.correct[premiseKey];
};

const save = () => emit('save', elementData);

const updateData = (data: ElementData) => {
  Object.assign(elementData, cloneDeep(data));
};

watch(() => props.element.data, updateData);
</script>

<style lang="scss" scoped>
.tce-container {
  text-align: left;
}
</style>
