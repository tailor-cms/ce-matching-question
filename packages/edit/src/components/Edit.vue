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
    <div class="d-flex align-center justify-center">
      <VTextField
        :model-value="elementData.headings.premise"
        :readonly="isDisabled"
        :rules="[requiredRule]"
        placeholder="Response value..."
        @update:model-value="updateHeading('premise', $event)"
      />
      <VTextField
        :model-value="elementData.headings.response"
        :readonly="isDisabled"
        :rules="[requiredRule]"
        placeholder="Response value..."
        @update:model-value="updateHeading('response', $event)"
      />
    </div>
    <VSlideYTransition group>
      <div
        v-for="(responseKey, premiseKey) in elementData.correct"
        :key="responseKey"
        class="d-flex align-center justify-center"
      >
        <VTextField
          :model-value="getPremiseContent(premiseKey)"
          :readonly="isDisabled"
          :rules="[requiredRule]"
          placeholder="Premise value..."
          @update:model-value="updatePremiseContent(premiseKey, $event)"
        />
        <VIcon icon="mdi-arrow-right" />
        <VTextField
          :model-value="getResponseContent(responseKey)"
          :readonly="isDisabled"
          :rules="[requiredRule]"
          placeholder="Response value..."
          @update:model-value="updateResponseContent(responseKey, $event)"
        />
        <VBtn
          v-if="!isDisabled && pairsCount > 2"
          aria-label="Remove answer"
          density="comfortable"
          icon="mdi-close"
          variant="text"
          @click="removeItem(premiseKey, responseKey)"
        />
      </div>
    </VSlideYTransition>
    <div class="d-flex justify-center align-center mb-2">
      <VBtn
        v-if="!isDisabled"
        prepend-icon="mdi-plus"
        size="small"
        variant="text"
        rounded
        @click="addItem"
      >
        Add Answer
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
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import pull from 'lodash/pull';
import size from 'lodash/size';
import { v4 as uuid } from 'uuid';

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
};

const updateResponseContent = (key: string, value: string) => {
  const response = getResponseItem(key);
  if (response) response.value = value;
};

const addItem = () => {
  const premiseKey = uuid();
  const responseKey = uuid();
  elementData.premises.push({ key: premiseKey, value: '' });
  elementData.responses.push({ key: responseKey, value: '' });
  elementData.correct[premiseKey] = responseKey;
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
