<template>
  <div class="tce-matching-question">
    <div class="mb-4">
      <div class="d-flex align-center ga-3 mb-3">
        <div class="pair-index" />
        <VTextField
          :model-value="elementData.headings.premise"
          :readonly="isReadonly"
          :rules="[(val: string) => !!val || 'Premise heading is required']"
          density="comfortable"
          hide-details="auto"
          label="Premise heading"
          variant="outlined"
          @update:model-value="updateHeading('premise', $event)"
        />
        <div class="pair-arrow" />
        <VTextField
          :model-value="elementData.headings.response"
          :readonly="isReadonly"
          :rules="[(val: string) => !!val || 'Response heading is required']"
          density="comfortable"
          hide-details="auto"
          label="Response heading"
          variant="outlined"
          @update:model-value="updateHeading('response', $event)"
        />
        <div v-if="!isReadonly" class="pair-action" />
      </div>
      <VSlideYTransition group>
        <div
          v-for="(responseKey, premiseKey, index) in correctPairs"
          :key="responseKey"
          class="d-flex align-center ga-3 my-2"
        >
          <VAvatar
            :text="String(index + 1)"
            class="pair-index text-label-medium font-weight-semibold"
            color="surface-container-highest"
            rounded="lg"
            size="small"
          />
          <VTextField
            :model-value="getPremiseContent(premiseKey)"
            :readonly="isReadonly"
            :rules="[(val: string) => !!val || 'Premise is required']"
            density="comfortable"
            placeholder="Premise value..."
            variant="outlined"
            hide-details
            @update:model-value="updatePremiseContent(premiseKey, $event)"
          />
          <VIcon
            class="pair-arrow"
            color="grey"
            icon="mdi-arrow-right"
            size="small"
          />
          <VTextField
            :model-value="getResponseContent(responseKey)"
            :readonly="isReadonly"
            :rules="[(val: string) => !!val || 'Response is required']"
            density="comfortable"
            placeholder="Response value..."
            variant="outlined"
            hide-details
            @update:model-value="updateResponseContent(responseKey, $event)"
          />
          <VBtn
            v-if="!isReadonly"
            :disabled="pairsCount <= PAIRS_LIMIT.MIN"
            aria-label="Remove answer"
            density="comfortable"
            icon="mdi-close"
            size="small"
            variant="text"
            @click="removeItem(premiseKey, responseKey)"
          />
        </div>
      </VSlideYTransition>
      <VInput
        :rules="pairsValidation"
        :validation-value="[elementData.premises, elementData.responses]"
        hide-details="auto"
      />
      <div
        v-if="!isReadonly && pairsCount < PAIRS_LIMIT.MAX"
        class="d-flex align-center ga-3 mt-2"
      >
        <div class="pair-index" />
        <div class="d-flex flex-grow-1 justify-center">
          <VBtn
            prepend-icon="mdi-plus"
            text="Add Pair"
            variant="text"
            @click="addItem"
          />
        </div>
        <div class="pair-action" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  cloneDeep,
  find,
  findIndex,
  remove,
  set,
  shuffle,
  size,
} from 'lodash-es';
import type {
  Element,
  ElementData,
} from '@tailor-cms/ce-matching-question-manifest';
import { computed } from 'vue';
import { v4 as uuid } from 'uuid';

const PAIRS_LIMIT = Object.freeze({
  MIN: 2,
  MAX: 10,
});

const props = defineProps<{
  element: Element;
  embedElementConfig: any[];
  isDragged: boolean;
  isFocused: boolean;
  isReadonly: boolean;
}>();
const emit = defineEmits<{
  update: [data: Partial<ElementData>];
}>();

const elementData = computed(() => props.element.data);
const correctPairs = computed(() => elementData.value.correct ?? {});
const pairsCount = computed(() => size(correctPairs.value));
const headings = computed(() => elementData.value.headings);

// One message for the whole list; the per-field rules only paint the outline.
const pairsValidation = [
  () => {
    const { premises, responses } = elementData.value;
    const isFilled = [...premises, ...responses].every((it) => !!it.value);
    return isFilled || 'All pair values are required';
  },
];

const getPremiseContent = (key: string) => getPremiseItem(key)?.value;
const getResponseContent = (key: string) => getResponseItem(key)?.value;

const getPremiseItem = (key: string) =>
  find(elementData.value.premises, { key });

const getResponseItem = (key: string) =>
  find(elementData.value.responses, { key });

const updateHeading = (key: string, value: string) => {
  emit('update', { headings: set({ ...headings.value }, key, value) });
};

const updatePremiseContent = (key: string, value: string) => {
  const premises = cloneDeep(elementData.value.premises);
  const index = findIndex(premises, { key });
  if (index >= 0) premises[index].value = value;
  emit('update', { premises: shuffle(premises) });
};

const updateResponseContent = (key: string, value: string) => {
  const responses = cloneDeep(elementData.value.responses);
  const index = findIndex(responses, { key });
  if (index >= 0) responses[index].value = value;
  emit('update', { responses: shuffle(responses) });
};

const addItem = () => {
  const { correct = {}, premises, responses } = cloneDeep(elementData.value);
  const premiseKey = uuid();
  const responseKey = uuid();
  premises.push({ key: premiseKey, value: '' });
  responses.push({ key: responseKey, value: '' });
  correct[premiseKey] = responseKey;
  emit('update', {
    premises: shuffle(premises),
    responses: shuffle(responses),
    correct,
  });
};

const removeItem = (premiseKey: string, responseKey: string) => {
  const { correct = {}, premises, responses } = cloneDeep(elementData.value);
  remove(premises, { key: premiseKey });
  remove(responses, { key: responseKey });
  delete correct[premiseKey];
  emit('update', { premises, responses, correct });
};
</script>

<style lang="scss" scoped>
.tce-matching-question {
  text-align: left;
}

// Fixed columns, so the heading row and the add button line up with the pairs.
// Widths match the controls in them: index avatar, arrow icon, remove button.
.pair-index {
  flex: none;
  width: 32px;
}

.pair-arrow {
  flex: none;
  width: 1.5rem;
}

.pair-action {
  flex: none;
  width: 28px;
}
</style>
