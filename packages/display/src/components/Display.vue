<template>
  <VForm ref="form" class="tce-root" @submit.prevent="submit">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="rich-text px-2 my-4" v-html="data.question"></div>
    <div v-if="data.hint" class="d-flex justify-end mb-4">
      <VTooltip
        v-model="showHint"
        :open-on-hover="false"
        location="bottom"
        max-width="350"
        close-on-back
        open-on-click
      >
        <template #activator="{ isActive, props: tooltipProps }">
          <VBtn
            v-click-outside="() => (showHint = false)"
            v-bind="tooltipProps"
            :active="isActive"
            :prepend-icon="`mdi-lightbulb-${isActive ? 'on' : 'outline'}`"
            size="small"
            text="Hint"
            variant="text"
            rounded
          />
        </template>
        {{ data.hint }}
      </VTooltip>
    </div>
    <div v-for="premise in data.premises" :key="premise.key" class="px-2 my-2">
      <div class="mb-2">
        <span class="font-weight-bold">{{ data.headings.premise }}:</span>
        {{ premise.value }}
      </div>
      <VSelect
        :items="data.responses"
        :label="data.headings.response"
        :readonly="submitted"
        :rules="[requiredRule]"
        item-title="value"
        item-value="key"
        @update:model-value="selectedAnswer[premise.key] = $event"
      >
        <template v-if="submitted" #append>
          <VIcon v-bind="iconProps(premise.key)" />
        </template>
      </VSelect>
    </div>
    <VAlert
      v-if="submitted"
      :text="userState?.isCorrect ? 'Correct' : 'Incorrect'"
      :type="userState?.isCorrect ? 'success' : 'error'"
      class="mb-3"
      rounded="lg"
      variant="tonal"
    />
    <div class="d-flex justify-end">
      <VBtn v-if="!submitted" type="submit" variant="tonal">Submit</VBtn>
      <VBtn v-else variant="tonal" @click="submitted = false">Try Again</VBtn>
    </div>
  </VForm>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { ElementData } from '@tailor-cms/ce-matching-question-manifest';

const initializeAnswer = () => cloneDeep(props.userState?.response) ?? {};

const props = defineProps<{ id: number; data: ElementData; userState: any }>();
const emit = defineEmits(['interaction']);

const showHint = ref(false);
const form = ref<HTMLFormElement>();
const submitted = ref(false);
const selectedAnswer = ref(initializeAnswer());

const requiredRule = (val: string | boolean | number) => {
  return !!val || 'You have to select an answer.';
};

const submit = async () => {
  const { valid } = await form.value?.validate();
  if (valid) {
    submitted.value = true;
    emit('interaction', { response: selectedAnswer.value });
  }
};

const iconProps = (uuid: string) => {
  const { response, correct } = props.userState;
  const isCorrect = response?.[uuid] === correct?.[uuid];
  if (isCorrect) return { icon: 'mdi-check-circle', color: 'success' };
  return { icon: 'mdi-close-circle', color: 'error' };
};

watch(
  () => props.userState,
  (state = {}) => {
    selectedAnswer.value = initializeAnswer();
    submitted.value = 'isCorrect' in state;
  },
  { deep: true },
);
</script>

<style scoped>
.tce-root {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
}
</style>
