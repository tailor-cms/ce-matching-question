<template>
  <VForm
    ref="form"
    class="tce-container"
    validate-on="submit"
    @submit.prevent="save"
  >
    <VTextarea
      v-model="elementData.question"
      :readonly="isDisabled"
      :rules="[requiredRule]"
      class="my-3"
      label="Question"
      rows="3"
      auto-grow
    />
    <div class="text-subtitle-2 mb-2">Answers</div>
    <VRow>
      <VCol cols="4" offset="1">
        <VTextField
          :model-value="elementData.headings.premise"
          :readonly="isDisabled"
          :rules="[requiredRule]"
          label="Premise heading"
          @update:model-value="updateHeading('premise', $event)"
        />
      </VCol>
      <VCol cols="4" offset="2">
        <VTextField
          :model-value="elementData.headings.response"
          :readonly="isDisabled"
          :rules="[requiredRule]"
          label="Response heading"
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
            :rules="[requiredRule]"
            placeholder="Premise value..."
            @update:model-value="updatePremiseContent(premiseKey, $event)"
          />
        </VCol>
        <VCol class="text-center" cols="2">
          <VIcon class="my-4" icon="mdi-arrow-right" size="small" />
        </VCol>
        <VCol cols="4">
          <VTextField
            :model-value="getResponseContent(responseKey)"
            :readonly="isDisabled"
            :rules="[requiredRule]"
            placeholder="Response value..."
            @update:model-value="updateResponseContent(responseKey, $event)"
          />
        </VCol>
        <VCol cols="1">
          <VBtn
            v-if="!isDisabled && pairsCount > PAIRS_LIMIT.MIN"
            aria-label="Remove answer"
            class="my-4"
            density="comfortable"
            icon="mdi-close"
            size="small"
            variant="text"
            @click="removeItem(premiseKey, responseKey)"
          />
        </VCol>
      </VRow>
    </VSlideYTransition>
    <div class="d-flex justify-center align-center mb-2">
      <VBtn
        v-if="!isDisabled && pairsCount < PAIRS_LIMIT.MAX"
        class="mt-4"
        prepend-icon="mdi-plus"
        variant="text"
        rounded
        @click="addItem"
      >
        Add Pair
      </VBtn>
    </div>
    <div v-if="!isDisabled" class="d-flex justify-end">
      <VBtn :disabled="isDirty" variant="text" @click="cancel">Cancel</VBtn>
      <VBtn :disabled="isDirty" class="ml-2" type="submit" variant="tonal">
        Save
      </VBtn>
    </div>
  </VForm>
</template>

<script lang="ts" setup>
import { computed, defineEmits, defineProps, reactive, ref, watch } from 'vue';
import {
  Element,
  ElementData,
} from '@tailor-cms/ce-matching-question-manifest';
import cloneDeep from 'lodash/cloneDeep';
import { createId as cuid } from '@paralleldrive/cuid2';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import pull from 'lodash/pull';
import shuffle from 'lodash/shuffle';
import size from 'lodash/size';

const PAIRS_LIMIT = Object.freeze({
  MIN: 2,
  MAX: 10,
});

const emit = defineEmits(['save']);
const props = defineProps<{
  element: Element;
  isFocused: boolean;
  isDisabled: boolean;
}>();

const form = ref<HTMLFormElement>();
const elementData = reactive<ElementData>(cloneDeep(props.element.data));

const isDirty = computed(() => isEqual(elementData, props.element.data));
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
  const premiseKey = cuid();
  const responseKey = cuid();
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

const save = async () => {
  const { valid } = await form.value?.validate();
  if (valid) emit('save', elementData);
};

const cancel = () => {
  Object.assign(elementData, cloneDeep(props.element.data));
  form.value?.resetValidation();
};

const requiredRule = (val: string | boolean | number) => {
  return !!val || 'The field is required';
};

watch(
  () => props.element.data,
  (data) => Object.assign(elementData, cloneDeep(data)),
);
</script>

<style lang="scss" scoped>
.tce-container {
  text-align: left;
}
</style>
