<template>
  <QuestionContainer
    v-bind="{ elementData, embedElementConfig, isDisabled }"
    :show-feedback="false"
    @update="emit('update', $event)"
  >
    <div class="text-subtitle-2">Answers</div>
    <VRow class="mt-2">
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
            class="my-3"
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
import { computed, defineEmits, defineProps } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { Element } from '@tailor-cms/ce-matching-question-manifest';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import { QuestionContainer } from '@tailor-cms/core-components';
import remove from 'lodash/remove';
import set from 'lodash/set';
import shuffle from 'lodash/shuffle';
import size from 'lodash/size';
import { v4 as uuid } from 'uuid';

const PAIRS_LIMIT = Object.freeze({
  MIN: 2,
  MAX: 10,
});

const props = defineProps<{
  element: Element;
  embedElementConfig: any[];
  isFocused: boolean;
  isDisabled: boolean;
}>();
const emit = defineEmits(['save', 'update']);

const elementData = computed(() => props.element.data);
const pairsCount = computed(() => size(elementData.value.correct));
const headings = computed(() => elementData.value.headings);

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
  const { premises, responses, correct } = cloneDeep(elementData.value);
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
  const { premises, responses, correct } = cloneDeep(elementData.value);
  remove(premises, { key: premiseKey });
  remove(responses, { key: responseKey });
  delete correct[premiseKey];
  emit('update', { premises, responses, correct });
};
</script>

<style lang="scss" scoped>
.tce-container {
  text-align: left;
}
</style>
